import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getDemoUserId } from '@/lib/demo-user'

export const dynamic = 'force-dynamic'

// ===================================================================
// CONFIGURACION DE EMAIL (Gmail SMTP con contraseña de aplicacion)
// ===================================================================
// Los credenciales NUNCA se hardcodean en el codigo (el repo es publico).
// Se leen de variables de entorno:
//   GMAIL_USER          -> cuenta de Gmail que ENVIA (asesoradesalud.info@gmail.com)
//   GMAIL_APP_PASSWORD   -> contraseña de aplicacion de Google (16 caracteres)
//   EMAIL_TO             -> destino de las notificaciones (default = GMAIL_USER)
//
// Para produccion, setear estas 3 vars en Vercel (Settings -> Environment Variables).
// ===================================================================
const GMAIL_USER = process.env.GMAIL_USER || 'asesoradesalud.info@gmail.com'
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''
// Destino por defecto = la misma cuenta que envia (Gmail enviando a si mismo).
const EMAIL_TO = process.env.EMAIL_TO || GMAIL_USER

interface ContactPayload {
  nombre?: string
  telefono?: string
  email?: string
  mensaje?: string
  origen?: string // 'landing-hominis' | 'landing-seguros' — para diferenciar en el email
}

// POST /api/contact
// Recibe el formulario de contacto de la landing de seguros.
// El flujo es best-effort en cada paso para que un fallo en la DB
// (ej. tabla no migrada en Vercel) NUNCA impida que el email se envie.
//   1. Guardar el lead en la tabla Contacto (best-effort, no rompe si falla).
//   2. Enviar email a EMAIL_TO via Gmail SMTP (best-effort).
//   3. Crear notificacion para el admin (best-effort).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContactPayload | null
  if (!body) {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
  }

  const nombre = (body.nombre || '').trim()
  const telefono = (body.telefono || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const mensaje = (body.mensaje || '').trim()

  // Origen del lead: 'landing-hominis' (www.asesoradesalud.com.ar) o
  // 'landing-seguros' (cotiza.asesoradesalud.com.ar). Se usa para el subject
  // y el from del email, para que Agustina sepa de que landing viene cada lead.
  const origen = (body.origen || '').trim() === 'landing-hominis' ? 'landing-hominis' : 'landing-seguros'

  // Configuracion de email segun el origen
  const isHominis = origen === 'landing-hominis'
  const emailConfig = {
    label: isHominis ? 'Hominis' : 'Cotiza Seguros',
    fromName: isHominis ? 'Hominis - Asesor de Salud' : 'Cotiza - Asesora de Salud',
  }

  // Validacion de campos requeridos (coincide con los required del form).
  // El campo "empresa" se elimino porque solo trabajamos con Premedic.
  if (!nombre || !telefono || !email) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos (nombre, telefono, email)' },
      { status: 400 }
    )
  }

  // IP del cliente (para auditoria del lead); respetando x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : null

  // Capturar UTM de cookies (seteadas por el componente UtmCapturer en la landing).
  // El modelo Contacto (legacy) no tiene campos UTM, pero se incluyen en el email
  // para que Agustina vea la fuente de cada lead.
  const cookieStore = await cookies()
  const utm = {
    source: cookieStore.get('utm_source')?.value || null,
    medium: cookieStore.get('utm_medium')?.value || null,
    campaign: cookieStore.get('utm_campaign')?.value || null,
    term: cookieStore.get('utm_term')?.value || null,
    content: cookieStore.get('utm_content')?.value || null,
  }

  // 1) Registrar el lead en la tabla Contacto (legacy landing leads).
  //    BEST-EFFORT: si la DB falla (ej. tabla no migrada en Vercel), el lead
  //    no se guarda pero el email igual se envia (no rompemos el flujo).
  let leadId: string | null = null
  try {
    const nuevoLead = await db.contacto.create({
      data: {
        nombre,
        email,
        telefono,
        segmento: 'premedic', // unico company disponible
        mensaje: mensaje || null,
        origen,
        ip,
        estado: 'NUEVO',
      },
    })
    leadId = nuevoLead.id
  } catch (dbErr) {
    // La DB no debe bloquear el envio del email. Se loggea para diagnostico.
    console.error('[contact] Error guardando lead en DB (el email igual se enviara):', dbErr)
  }

  // 2) Enviar email via Gmail SMTP + nodemailer (best-effort).
  //    Solo se intenta si hay app password configurada.
  let emailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
  if (GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      })
      const info = await transporter.sendMail({
        from: `${emailConfig.fromName} <${GMAIL_USER}>`,
        to: EMAIL_TO,
        replyTo: email, // el interesado, para que Agustina pueda responder directo
        subject: `Nuevo lead de ${emailConfig.label} — ${nombre}`,
        html: renderEmailHtml({ nombre, telefono, email, mensaje, ip, utm }),
      })
      console.log('[contact] Email enviado:', info.messageId, '->', EMAIL_TO)
      emailStatus = 'sent'
    } catch (emailErr) {
      console.error('[contact] Error enviando email via Gmail:', emailErr)
      emailStatus = 'failed'
    }
  } else {
    console.warn('[contact] GMAIL_APP_PASSWORD no configurado — email NO enviado')
  }

  // 3) Notificacion para el admin del dashboard (best-effort, no rompe si falla)
  try {
    const adminId = await getDemoUserId()
    if (adminId) {
      await db.notification.create({
        data: {
          userId: adminId,
          type: 'CONTACT',
          title: 'Nuevo lead de la landing',
          message: `${nombre} (${email}) — tel: ${telefono}`,
          link: '/',
        },
      })
    }
  } catch (notifErr) {
    console.error('[contact] Error creando notificacion (no bloquea el envio):', notifErr)
  }

  // Si el email se envio correctamente, consideramos el envio exitoso aun si
  // la DB fallo. Si el email fallo Y la DB fallo, ahi si devolvemos error.
  if (emailStatus === 'failed' && !leadId) {
    return NextResponse.json(
      { error: 'No se pudo enviar el mensaje. Intentá de nuevo.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    id: leadId,
    email: emailStatus,
  })
}

// Plantilla HTML simple y legible para el email que recibe Agustina.
function renderEmailHtml({
  nombre,
  telefono,
  email,
  mensaje,
  ip,
  utm,
}: {
  nombre: string
  telefono: string
  email: string
  mensaje: string
  ip: string | null
  utm: { source: string | null; medium: string | null; campaign: string | null; term: string | null; content: string | null }
}): string {
  const rows = [
    ['Nombre', nombre],
    ['Email', email],
    ['Teléfono', telefono],
    ['Mensaje', mensaje || '(sin mensaje)'],
    ['IP de origen', ip || '(no disponible)'],
    ['UTM source', utm.source || '(directo)'],
    ['UTM medium', utm.medium || '(no disponible)'],
    ['UTM campaign', utm.campaign || '(no disponible)'],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 12px;font-size:14px;vertical-align:top">${escapeHtml(String(value))}</td></tr>`
    )
    .join('')
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#077B7A;color:#fff;padding:16px 20px">
        <h2 style="margin:0;font-size:16px;font-weight:600">Nuevo lead de la landing de seguros</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.9">Cotiza. Asesora de Salud — formulario de contacto</p>
      </div>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
      <div style="background:#f8fafc;padding:12px 20px;font-size:11px;color:#94a3b8">
        Respondé directamente a este email para contactar a ${escapeHtml(nombre)}.
      </div>
    </div>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
