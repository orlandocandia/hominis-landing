import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDemoUserId } from '@/lib/demo-user'

export const dynamic = 'force-dynamic'

// Destino por defecto del formulario de contacto de la landing de seguros.
// Se puede sobreescribir con la variable de entorno CONTACT_EMAIL en Vercel.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'asesoradesaludagustinacandia@gmail.com'

// Remitente del email. Si no hay dominio verificado configurado, se usa el
// dominio demo de Resend (onboarding@resend.dev), que solo entrega al dueno
// de la cuenta de Resend. Para produccion, configurar RESEND_FROM con un
// dominio verificado en Resend, ej: "Asesora de Salud <noreply@asesoradesalud.com.ar>"
const RESEND_FROM = process.env.RESEND_FROM || 'Landing Asesora de Salud <onboarding@resend.dev>'

interface ContactPayload {
  nombre?: string
  telefono?: string
  email?: string
  empresa?: string
  mensaje?: string
}

// POST /api/contact
// Recibe el formulario de contacto de la landing de seguros.
// Hace dos cosas (ambas best-effort para que el lead nunca se pierda):
//   1. Registra el lead en la tabla Contacto (visible en el dashboard).
//   2. Envia un email a CONTACT_EMAIL via Resend (si RESEND_API_KEY esta seteado).
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

    // 2) Enviar email via Resend (best-effort: si falla, el lead ya esta guardado).
    //    Solo se intenta si hay RESEND_API_KEY configurado.
    let emailStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { error } = await resend.emails.send({
          from: RESEND_FROM,
          to: CONTACT_EMAIL,
          replyTo: email, // el interesado, para que Agustina pueda responder directo
          subject: `Nuevo lead de la landing — ${nombre}`,
          html: renderEmailHtml({ nombre, telefono, email, empresa, mensaje, ip }),
        })
        if (error) {
          console.error('Resend devolvio error:', error)
          emailStatus = 'failed'
        } else {
          emailStatus = 'sent'
        }
      } catch (emailErr) {
        console.error('Error enviando email de contacto:', emailErr)
        emailStatus = 'failed'
      }
    } else {
      console.warn('[contact] RESEND_API_KEY no configurado — lead guardado en DB pero email NO enviado')
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
