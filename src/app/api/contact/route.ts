import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
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
//   EMAIL_TO        -> destino de las notificaciones (default = GMAIL_USER)
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
  empresa?: string
  mensaje?: string
}

// POST /api/contact
// Recibe el formulario de contacto de la landing de seguros.
// Hace tres cosas (todas best-effort para que el lead nunca se pierda):
//   1. Registra el lead en la tabla Contacto (visible en el dashboard).
//   2. Envia un email a EMAIL_TO via Gmail SMTP (si hay app password).
//   3. Crea una notificacion para el admin (best-effort).
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as ContactPayload | null
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
    }

    const nombre = (body.nombre || '').trim()
    const telefono = (body.telefono || '').trim()
    const email = (body.email || '').trim().toLowerCase()
    const empresa = (body.empresa || '').trim()
    const mensaje = (body.mensaje || '').trim()

    // Validacion de campos requeridos (coincide con los required del form)
    if (!nombre || !telefono || !email || !empresa) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (nombre, telefono, email, empresa)' },
        { status: 400 }
      )
    }

    // IP del cliente (para auditoria del lead); respetando x-forwarded-for
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null

    // 1) Registrar el lead en la tabla Contacto (legacy landing leads).
    //    segmento = empresa de interes, origen = landing, estado = NUEVO.
    const nuevoLead = await db.contacto.create({
      data: {
        nombre,
        email,
        telefono,
        segmento: empresa,
        mensaje: mensaje || null,
        cobertura: empresa, // duplicamos empresa de interes en cobertura para el CRM
        origen: 'landing-seguros',
        ip,
        estado: 'NUEVO',
      },
    })

    // 2) Enviar email via Gmail SMTP + nodemailer (best-effort: si falla, el
    //    lead ya esta guardado en la DB). Solo se intenta si hay app password.
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
          from: `Landing Asesora de Salud <${GMAIL_USER}>`,
          to: EMAIL_TO,
          replyTo: email, // el interesado, para que Agustina pueda responder directo
          subject: `Nuevo lead de la landing — ${nombre}`,
          html: renderEmailHtml({ nombre, telefono, email, empresa, mensaje, ip }),
        })
        console.log('[contact] Email enviado:', info.messageId, '->', EMAIL_TO)
        emailStatus = 'sent'
      } catch (emailErr) {
        console.error('Error enviando email de contacto via Gmail:', emailErr)
        emailStatus = 'failed'
      }
    } else {
      console.warn('[contact] GMAIL_APP_PASSWORD no configurado — lead guardado en DB pero email NO enviado')
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
            message: `${nombre} (${email}) — empresa: ${empresa}`,
            link: '/',
          },
        })
      }
    } catch (notifErr) {
      // No rompemos el flujo si la notificacion falla (el lead ya esta guardado)
      console.error('Error creando notificacion de contacto:', notifErr)
    }

    return NextResponse.json({
      ok: true,
      id: nuevoLead.id,
      email: emailStatus,
    })
  } catch (error) {
    console.error('Error en POST /api/contact:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detail: String(error) },
      { status: 500 }
    )
  }
}

// Plantilla HTML simple y legible para el email que recibe Agustina.
function renderEmailHtml({
  nombre,
  telefono,
  email,
  empresa,
  mensaje,
  ip,
}: {
  nombre: string
  telefono: string
  email: string
  empresa: string
  mensaje: string
  ip: string | null
}): string {
  const rows = [
    ['Nombre', nombre],
    ['Email', email],
    ['Teléfono', telefono],
    ['Empresa de interés', empresa],
    ['Mensaje', mensaje || '(sin mensaje)'],
    ['IP de origen', ip || '(no disponible)'],
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
