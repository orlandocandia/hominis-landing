import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { cookies } from 'next/headers'
import { db, DB_VERSION } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

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
  empresaId?: string // opcional: asociar lead a una empresa
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

  // 1) Registrar el lead en la tabla Contact (modelo unificado).
  //    BEST-EFFORT: si la DB falla (ej. tabla no migrada en Vercel), el lead
  //    no se guarda pero el email igual se envia (no rompemos el flujo).
  //
  //    PROBLEMA CONOCIDO (corregido): antes se usaba `admin?.id || 'admin-hardcodeado'`
  //    como fallback. Si no habia ADMIN en la DB, se intentaba crear un Contact
  //    con un ownerId inexistente → violacion de FK → el lead NO se guardaba
  //    (silenciosamente, porque el error se capturaba). Ahora hacemos una cadena
  //    de fallbacks robusta: ADMIN → cualquier usuario activo → cualquier usuario
  //    → crear un admin por defecto. Asi el lead SIEMPRE se guarda si la DB responde.
  //
  //    PROBLEMA 2 (corregido): si el schema de la DB de produccion (Turso) esta
  //    desactualizado (ej. falta la columna empresaId porque no se corrio
  //    `prisma db push`), el db.contact.create() con todos los campos falla.
  //    Ahora se intenta primero el create completo, y si falla, se reintenta con
  //    un payload MINIMO (solo los 3 campos required: name, address, ownerId).
  //    Asi el lead SIEMPRE se guarda aunque el schema este desactualizado.
  let leadId: string | null = null
  let dbError: string | null = null
  try {
    // 1.a) Buscar un ownerId valido (cadena de fallbacks).
    //      ownerId es FK restrict en el schema → debe existir en User.
    let owner = await db.user.findFirst({
      where: { rol: 'ADMIN', activo: true },
      select: { id: true },
    })
    if (!owner) {
      // Sin ADMIN activo → buscar cualquier ADMIN (incluso inactivo)
      owner = await db.user.findFirst({ where: { rol: 'ADMIN' }, select: { id: true } })
    }
    if (!owner) {
      // Sin ADMIN → cualquier usuario activo
      owner = await db.user.findFirst({ where: { activo: true }, select: { id: true } })
    }
    if (!owner) {
      // Sin usuarios activos → cualquier usuario
      owner = await db.user.findFirst({ select: { id: true } })
    }
    if (!owner) {
      // No hay NINGUN usuario en la DB → crear un admin por defecto para que
      // los leads tengan un ownerId valido y aparezcan en el panel de mensajes.
      console.warn('[contact] No hay usuarios en la DB. Creando admin por defecto.')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('Hominis2025!', 10)
      owner = await db.user.create({
        data: {
          email: 'admin@hominis.com',
          password: hashedPassword,
          nombre: 'Admin',
          rol: 'ADMIN',
          activo: true,
        },
        select: { id: true },
      })
    }

    // 1.b) Crear el lead en la tabla Contact (modelo unificado).
    //      Mapeo de campos del form → schema Contact.
    //      Intento 1: payload completo (todos los campos).
    try {
      const nuevoLead = await db.contact.create({
        data: {
          name: nombre,
          primaryEmail: email,
          primaryPhone: telefono,
          address: '', // required field (no nullable en schema), vacio para leads de landing
          message: mensaje || null,
          status: 'NUEVO',
          ownerId: owner.id, // SIEMPRE un ID valido ahora
          // Marketing analytics (UTM via source fields)
          sourceReferrer: origen,
          sourceIp: ip,
          empresaId: body.empresaId || null,
        },
      })
      leadId = nuevoLead.id
      console.log('[contact] Lead guardado en DB (full):', leadId, 'ownerId:', owner.id)
    } catch (fullErr) {
      // Intento 1 fallo (probablemente schema desactualizado: columna empresaId,
      // sourceReferrer, o sourceIp no existe en la DB de produccion).
      // Intento 2: payload MINIMO (solo los 3 campos required por el schema).
      console.warn('[contact] Create completo fallo, reintentando con payload minimo. Error:', (fullErr as Error)?.message)
      try {
        const nuevoLead = await db.contact.create({
          data: {
            name: nombre,
            address: '', // required
            ownerId: owner.id, // required (FK)
            status: 'NUEVO',
          },
        })
        leadId = nuevoLead.id
        console.log('[contact] Lead guardado en DB (minimal fallback):', leadId, 'ownerId:', owner.id)
      } catch (minErr) {
        // Ambos intentos fallaron. Guardar el error para diagnostico.
        dbError = (minErr as Error)?.message?.slice(0, 300) || String(minErr)
        console.error('[contact] Error guardando lead en DB (ambos intentos fallaron):', minErr)
      }
    }
  } catch (dbErr) {
    dbError = (dbErr as Error)?.message?.slice(0, 300) || String(dbErr)
    console.error('[contact] Error en la cadena de ownerId/email (el email igual se enviara):', dbErr)
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

  // 3) Notificacion para el admin del dashboard (best-effort).
  //    Intenta obtener el userId de la sesion real; si no hay sesion
  //    (ej. el lead vino de la landing publica), busca un admin con la misma
  //    cadena de fallbacks usada arriba.
  try {
    const session = await requireAuth()
    let adminId: string | null = null
    if (session?.user) {
      adminId = (session.user as any).id as string
    } else {
      // Fallback: buscar un admin con la misma cadena que arriba.
      let admin = await db.user.findFirst({ where: { rol: 'ADMIN', activo: true }, select: { id: true } })
      if (!admin) admin = await db.user.findFirst({ where: { rol: 'ADMIN' }, select: { id: true } })
      if (!admin) admin = await db.user.findFirst({ where: { activo: true }, select: { id: true } })
      if (!admin) admin = await db.user.findFirst({ select: { id: true } })
      adminId = admin?.id ?? null
    }
    if (adminId) {
      await db.notification.create({
        data: {
          userId: adminId,
          type: 'CONTACT',
          title: `Nuevo lead de ${emailConfig.label}`,
          message: `${nombre} (${email}) — tel: ${telefono}`,
          link: '/admin/mensajes',
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
      { error: 'No se pudo enviar el mensaje. Intentá de nuevo.', dbError },
      { status: 500 }
    )
  }

  // dbError se incluye solo cuando el lead no se guardo, para diagnostico.
  // Si el lead se guardo OK (leadId !== null), dbError queda en null y no se envia.
  return NextResponse.json({
    ok: true,
    id: leadId,
    email: emailStatus,
    dbVersion: DB_VERSION, // marca de version para detectar si el nuevo codigo esta live
    // 🔥 DIAGNOSTICO: mostrar el estado de process.env en runtime
    envDiagnostic: {
      DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 40) : '(not set)',
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? '(set)' : '(not set)',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '(set)' : '(not set)',
    },
    ...(leadId ? {} : { dbError }), // exponer dbError solo si el lead NO se guardo
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
  const crmLink = 'https://www.asesoradesalud.com.ar/login'

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
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" style="vertical-align:middle;margin-right:8px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                       Contactar por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Acciones rapidas -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;padding-top:16px;">
                <tr>
                  <td style="font-size:14px;color:#6b7280;">
                    🔐 <a href="${crmLink}" style="color:${brandColor};text-decoration:none;font-weight:600;">Acceder al Dashboard</a>
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
