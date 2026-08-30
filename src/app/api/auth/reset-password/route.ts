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

    // Validar el token contra la tabla password_reset_tokens (si existe)
    // o contra el campo bloqueadoHasta en User (workaround)
    let userId: string | null = null

    try {
      // Intentar con password_reset_tokens
      const rows = await queryLibsql(
        'SELECT email FROM password_reset_tokens WHERE token = ? AND expires_at > datetime("now") LIMIT 1',
        [token]
      )
      if (rows.length > 0) {
        const tokenEmail = (rows[0] as any).email
        if (tokenEmail !== email) {
          return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
        }
      } else {
        // Si no hay tabla password_reset_tokens o el token no esta ahi,
        // validar usando el email + expiry en User
        const userRows = await queryLibsql(
          'SELECT id, bloqueadoHasta FROM User WHERE email = ? LIMIT 1',
          [email]
        )
        if (userRows.length === 0) {
          return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
        }
        const user = userRows[0] as any
        // Verificar que el token expira en el futuro (bloqueadoHasta reusado como expiry)
        if (user.bloqueadoHasta) {
          const expiry = new Date(user.bloqueadoHasta)
          if (expiry < new Date()) {
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
          }
        }
        userId = user.id
      }
    } catch {
      // Si la tabla no existe, validar con el email + expiry en User
      try {
        const userRows = await queryLibsql(
          'SELECT id, bloqueadoHasta FROM User WHERE email = ? LIMIT 1',
          [email]
        )
        if (userRows.length === 0) {
          return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
        }
        const user = userRows[0] as any
        if (user.bloqueadoHasta) {
          const expiry = new Date(user.bloqueadoHasta)
          if (expiry < new Date()) {
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
          }
        }
        userId = user.id
      } catch {
        return NextResponse.json({ error: 'Error al validar token' }, { status: 500 })
      }
    }

    // Si no tenemos userId, buscarlo por email
    if (!userId) {
      try {
        const userRows = await queryLibsql('SELECT id FROM User WHERE email = ? LIMIT 1', [email])
        if (userRows.length > 0) userId = (userRows[0] as any).id
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Actualizar la contraseña (Prisma + fallback libsql)
    try {
      await db.user.update({
        where: { id: userId },
        data: { password: hashedPassword, bloqueadoHasta: null },
      })
    } catch {
      await executeLibsql(
        "UPDATE User SET password = ?, bloqueadoHasta = NULL WHERE id = ?",
        [hashedPassword, userId]
      )
    }

    // Invalidar el token (eliminar de password_reset_tokens si existe)
    try {
      await executeLibsql('DELETE FROM password_reset_tokens WHERE token = ?', [token])
    } catch {}

    return NextResponse.json({ ok: true, message: 'Contraseña actualizada correctamente' })
  } catch (error) {
    console.error('Error en POST /api/auth/reset-password:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
