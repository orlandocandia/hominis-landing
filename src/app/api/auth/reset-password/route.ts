import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST /api/auth/reset-password
// Body: { token: string, email: string, password: string }
// Valida el token y actualiza la contraseña.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.token || !body.password) {
      return NextResponse.json({ error: 'Token y contraseña requeridos' }, { status: 400 })
    }

    if (body.password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const token = body.token
    const email = (body.email || '').trim().toLowerCase()

    console.log('[reset-password] Attempt for email:', email, '| token:', token.slice(0, 20) + '...')

    // Paso 1: Validar el token en password_reset_tokens
    let userId: string | null = null

    try {
      const rows = await queryLibsql(
        "SELECT email, expiresAt, used FROM password_reset_tokens WHERE token = ? LIMIT 1",
        [token]
      )
      if (rows.length > 0) {
        const row = rows[0] as any
        console.log('[reset-password] Token found in password_reset_tokens:', { email: row.email, expiresAt: row.expiresAt, used: row.used })

        // Verificar que el token no haya sido usado
        if (row.used === 1 || row.used === true) {
          console.log('[reset-password] ❌ Token already used')
          return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
        }

        // Verificar que el email coincida
        if (row.email !== email) {
          console.log('[reset-password] ❌ Email mismatch:', row.email, 'vs', email)
          return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
        }

        // Verificar expiración
        if (row.expiresAt) {
          const expiry = new Date(row.expiresAt)
          if (expiry < new Date()) {
            console.log('[reset-password] ❌ Token expired')
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
          }
        }
        console.log('[reset-password] ✅ Token valid')
      } else {
        console.log('[reset-password] ❌ Token not found in password_reset_tokens')
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
      }
    } catch (tokenErr) {
      console.warn('[reset-password] Error querying password_reset_tokens:', (tokenErr as Error)?.message?.slice(0, 150))
      return NextResponse.json({ error: 'Error al validar token' }, { status: 500 })
    }

    // Paso 2: Buscar el userId por email
    try {
      const userRows = await queryLibsql('SELECT id FROM User WHERE email = ? LIMIT 1', [email])
      if (userRows.length > 0) {
        userId = (userRows[0] as any).id
        console.log('[reset-password] ✅ User found:', userId.slice(0, 12) + '...')
      } else {
        console.log('[reset-password] ❌ User not found for email:', email)
        return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
      }
    } catch (userErr) {
      console.error('[reset-password] Error finding user:', userErr)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    // Paso 3: Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(body.password, 10)
    console.log('[reset-password] ✅ Password hashed:', hashedPassword.slice(0, 20) + '...')

    // Paso 4: Actualizar la contraseña en User (Prisma + fallback libsql)
    try {
      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword, bloqueadoHasta: null },
      })
      console.log('[reset-password] ✅ Password updated via Prisma')
    } catch {
      // Fallback libsql
      const affected = await executeLibsql(
        "UPDATE User SET password = ?, bloqueadoHasta = NULL WHERE id = ?",
        [hashedPassword, userId]
      )
      console.log('[reset-password] ✅ Password updated via libsql (rows affected:', affected, ')')
    }

    // Paso 5: Marcar el token como usado
    try {
      await executeLibsql(
        "UPDATE password_reset_tokens SET used = 1 WHERE token = ?",
        [token]
      )
      console.log('[reset-password] ✅ Token marked as used')
    } catch {}

    return NextResponse.json({ ok: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error en POST /api/auth/reset-password:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
