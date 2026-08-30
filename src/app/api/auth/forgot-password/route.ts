import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const GMAIL_USER = process.env.GMAIL_USER || 'asesoradesalud.info@gmail.com'
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ''
const EMAIL_TO = process.env.EMAIL_TO || GMAIL_USER
const APP_URL = process.env.NEXTAUTH_URL || 'https://www.asesoradesalud.com.ar'

// POST /api/auth/forgot-password
// Body: { email: string }
// Genera un token unico, lo guarda en la DB, y envia un correo con el enlace de reseteo.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()

    // Buscar el usuario en la DB (Prisma + fallback libsql)
    let user: { id: string; email: string; nombre: string } | null = null
    try {
      user = await db.user.findFirst({
        where: { email },
        select: { id: true, email: true, nombre: true },
      })
    } catch {
      // Fallback libsql
      const rows = await queryLibsql('SELECT id, email, nombre FROM User WHERE email = ? LIMIT 1', [email])
      if (rows.length > 0) user = rows[0] as any
    }

    // Por seguridad, siempre devolver exito (no revelar si el email existe)
    if (!user) {
      return NextResponse.json({ ok: true, message: 'Si el email existe, recibirás un correo de recuperación.' })
    }

    // Generar token unico
    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar el token en la DB (usar un campo en User o una tabla separada)
    // Usamos un enfoque simple: guardamos en password_reset_tokens (si existe) o en User
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          bloqueadoHasta: expiry, // reusamos este campo como expiry del token (workaround)
        },
      })
    } catch {
      // Fallback libsql
      await executeLibsql(
        "UPDATE User SET bloqueadoHasta = ? WHERE id = ?",
        [expiry.toISOString(), user.id]
      ).catch(() => {})
    }

    // Guardar el token en password_reset_tokens (columnas: id, email, token, expiresAt, used, createdAt)
    try {
      await executeLibsql(
        `INSERT INTO password_reset_tokens (id, email, token, expiresAt, createdAt)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [crypto.randomUUID(), email, token, expiry.toISOString()]
      )
      console.log('[forgot-password] Token saved to password_reset_tokens')
    } catch (tokenErr) {
      console.warn('[forgot-password] Could not save token to password_reset_tokens:', (tokenErr as Error)?.message?.slice(0, 150))
    }

    // Enviar el correo
    if (GMAIL_APP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        })

        const resetUrl = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

        await transporter.sendMail({
          from: `Hominis CRM <${GMAIL_USER}>`,
          to: email,
          replyTo: GMAIL_USER,
          subject: 'Recuperación de contraseña — Hominis CRM',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1d4ed8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2>Hominis CRM — Recuperación de contraseña</h2>
              </div>
              <div style="padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px;">
                <p>Hola ${user.nombre},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva:</p>
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${resetUrl}" style="background: #1d4ed8; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Restablecer contraseña
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 13px;">Si no solicitaste este cambio, ignorá este correo. El enlace expira en 1 hora.</p>
                <p style="color: #6b7280; font-size: 12px; word-break: break-all;">Enlace: ${resetUrl}</p>
              </div>
            </div>
          `,
        })
        console.log('[forgot-password] Email sent to:', email)
      } catch (emailErr) {
        console.error('[forgot-password] Error sending email:', emailErr)
        // No revelar el error al usuario
      }
    } else {
      console.warn('[forgot-password] GMAIL_APP_PASSWORD not configured')
    }

    return NextResponse.json({ ok: true, message: 'Si el email existe, recibirás un correo de recuperación.' })
  } catch (error) {
    console.error('Error en POST /api/auth/forgot-password:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
