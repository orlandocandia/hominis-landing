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
        html: renderEmailHtml({ nombre, telefono, email, mensaje, origen }),
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

// Plantilla HTML del email que recibe Agustina. Diseño limpio, responsive,
// con badge de origen, boton de WhatsApp directo, y link al CRM.
// NO incluye datos tecnicos (IP, UTM) — son irrelevantes para la clienta.
function renderEmailHtml({
  nombre,
  telefono,
  email,
  mensaje,
  origen,
}: {
  nombre: string
  telefono: string
  email: string
  mensaje: string
  origen: string
}): string {
  const isHominis = origen === 'landing-hominis'
  const brandName = isHominis ? 'Hominis' : 'Cotiza Seguros'
  const brandEmoji = isHominis ? '🏥' : '📋'
  const brandColor = isHominis ? '#1d4ed8' : '#059669' // azul / verde
  const brandColorLight = isHominis ? '#eff6ff' : '#ecfdf5'
  const greetingName = isHominis ? 'Hominis' : 'Cotiza'

  // WhatsApp link: limpia el telefono (solo digitos) + mensaje predefinido
  const cleanPhone = telefono.replace(/\D/g, '')
  const waText = encodeURIComponent(
    `Hola ${nombre}! Soy Agustina de ${greetingName}. Recibí tu consulta, ¿cómo puedo ayudarte?`
  )
  const waLink = `https://wa.me/${cleanPhone}?text=${waText}`

  // CRM link
  const crmLink = 'https://www.asesoradesalud.com.ar/dashboard'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Banner de origen -->
          <tr>
            <td style="background:${brandColor};padding:16px 24px;">
              <span style="font-size:20px;">${brandEmoji}</span>
              <span style="color:#ffffff;font-size:16px;font-weight:bold;margin-left:8px;">${escapeHtml(brandName)} — Asesoría de Salud</span>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:24px;">

              <h2 style="margin:0 0 8px;font-size:20px;color:#1f2937;">¡Nuevo lead de contacto!</h2>
              <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Una persona completó el formulario en la landing de ${escapeHtml(brandName)}.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:${brandColorLight};border-radius:8px;margin-bottom:20px;">
                <tr><td style="padding:16px;">

                  <!-- Nombre -->
                  <p style="margin:0 0 12px;font-size:15px;color:#1f2937;">
                    <strong>👤 Nombre:</strong> ${escapeHtml(nombre)}
                  </p>

                  <!-- Telefono -->
                  <p style="margin:0 0 12px;font-size:15px;color:#1f2937;">
                    <strong>📞 Teléfono:</strong>
                    <a href="tel:${escapeHtml(telefono)}" style="color:${brandColor};text-decoration:none;font-weight:600;">${escapeHtml(telefono)}</a>
                  </p>

                  <!-- Email -->
                  <p style="margin:0 0 12px;font-size:15px;color:#1f2937;">
                    <strong>✉️ Email:</strong>
                    <a href="mailto:${escapeHtml(email)}" style="color:${brandColor};text-decoration:none;font-weight:600;">${escapeHtml(email)}</a>
                  </p>

                  <!-- Mensaje (si hay) -->
                  ${mensaje ? `
                  <p style="margin:0;font-size:15px;color:#1f2937;">
                    <strong>💬 Mensaje:</strong><br>
                    <span style="display:inline-block;margin-top:4px;padding:8px 12px;background:#ffffff;border-radius:6px;font-size:14px;color:#374151;">${escapeHtml(mensaje)}</span>
                  </p>
                  ` : ''}

                </td></tr>
              </table>

              <!-- Boton WhatsApp -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 20px;">
                    <a href="${waLink}" target="_blank"
                       style="display:inline-block;background:#25D366;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:50px;font-weight:bold;font-size:16px;">
                       💬 Contactar por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Acciones rapidas -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:16px;">
                <tr>
                  <td style="font-size:14px;color:#6b7280;">
                    📌 <a href="${crmLink}" style="color:${brandColor};text-decoration:none;font-weight:600;">Ver en el CRM</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:12px 24px;background:#f9fafb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Este correo fue enviado desde el formulario de contacto de ${escapeHtml(brandName)}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
