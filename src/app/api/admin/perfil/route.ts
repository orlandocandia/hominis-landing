import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/admin/perfil — obtener datos del admin autenticado
export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const email = (session.user as any).email as string

    // Buscar el admin real en la DB (si userId es 'admin-hardcodeado', buscar por email)
    try {
      const rows = await queryLibsql(
        'SELECT id, email, nombre, apellido, rol, avatarUrl FROM User WHERE email = ? LIMIT 1',
        [email]
      )
      if (rows.length > 0) {
        return NextResponse.json(rows[0])
      }
      // Si no se encuentra en la DB (admin hardcoded), devolver datos de la sesion
      return NextResponse.json({
        id: userId,
        email,
        nombre: (session.user as any).name || 'Administrador',
        apellido: null,
        rol: 'ADMIN',
        avatarUrl: null,
      })
    } catch (err) {
      // Fallback: devolver datos de la sesion
      return NextResponse.json({
        id: userId,
        email,
        nombre: (session.user as any).name || 'Administrador',
        apellido: null,
        rol: 'ADMIN',
        avatarUrl: null,
      })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/admin/perfil — cambiar contraseña del admin (valida currentPassword)
// NO permite cambiar el email.
export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const email = (session.user as any).email as string
    const body = await request.json().catch(() => ({}))

    // Caso 1: Cambiar contraseña
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Debes ingresar tu contraseña actual' }, { status: 400 })
      }
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
      }

      // Buscar el admin en la DB por email
      let userId: string | null = null
      let storedPassword: string | null = null

      try {
        const rows = await queryLibsql(
          'SELECT id, password FROM User WHERE email = ? LIMIT 1',
          [email]
        )
        if (rows.length > 0) {
          userId = (rows[0] as any).id
          storedPassword = (rows[0] as any).password
        }
      } catch {}

      if (!userId || !storedPassword) {
        // Admin hardcoded — no se puede cambiar la contraseña en la DB
        return NextResponse.json({ error: 'No se puede cambiar la contraseña de este usuario' }, { status: 400 })
      }

      // Validar contraseña actual
      const isValid = await bcrypt.compare(body.currentPassword, storedPassword)
      if (!isValid) {
        return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
      }

      // Hashear y guardar la nueva contraseña
      const hashedPassword = await bcrypt.hash(body.newPassword, 10)

      try {
        await executeLibsql(
          "UPDATE User SET password = ? WHERE id = ?",
          [hashedPassword, userId]
        )
        console.log('[admin/perfil PATCH] ✅ Password updated for:', email)
        return NextResponse.json({ ok: true, message: 'Contraseña actualizada correctamente' })
      } catch (updateErr) {
        console.error('[admin/perfil PATCH] Error updating password:', updateErr)
        return NextResponse.json({ error: 'Error al actualizar la contraseña' }, { status: 500 })
      }
    }

    // Caso 2: Actualizar nombre (no email)
    if (body.nombre !== undefined) {
      let userId: string | null = null
      try {
        const rows = await queryLibsql('SELECT id FROM User WHERE email = ? LIMIT 1', [email])
        if (rows.length > 0) userId = (rows[0] as any).id
      } catch {}

      if (!userId) {
        return NextResponse.json({ error: 'No se puede actualizar este usuario' }, { status: 400 })
      }

      try {
        await executeLibsql(
          "UPDATE User SET nombre = ? WHERE id = ?",
          [body.nombre, userId]
        )
        return NextResponse.json({ ok: true, message: 'Perfil actualizado' })
      } catch {
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  } catch (error) {
    console.error('Error en PATCH /api/admin/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
