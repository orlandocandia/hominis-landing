import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    // === INTENTO 1: Prisma ===
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, nombre: true, apellido: true, telefono: true, avatarUrl: true, coverageAreas: true },
      })

      if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json(user)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/perfil GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const rows = await queryLibsql(
        'SELECT id, email, nombre, apellido, telefono, avatarUrl, coverageAreas FROM User WHERE id = ?',
        [userId]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json(rows[0])
    }
  } catch (error) {
    console.error('Error en GET /api/vendedor/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const body = await request.json().catch(() => ({}))

    const updateData: any = {
      ...(body.nombre && { nombre: body.nombre }),
      ...(body.apellido !== undefined && { apellido: body.apellido }),
      ...(body.telefono !== undefined && { telefono: body.telefono }),
      ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),  // NUEVO
    }

    // Change password
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Falta contraseña actual' }, { status: 400 })
      }
      const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } })
      if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      const isValid = await bcrypt.compare(body.currentPassword, user.password)
      if (!isValid) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })

      updateData.password = await bcrypt.hash(body.newPassword, 10)

      // Notify admin
      try {
        const admin = await db.user.findFirst({ where: { rol: 'ADMIN' }, select: { id: true } })
        if (admin) {
          await db.notification.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: 'Cambio de contraseña',
              message: `${session.user?.name || 'Vendedor'} cambió su contraseña.`,
              link: '/admin',
            },
          })
        }
      } catch {}
    }

    // === INTENTO 1: Prisma ===
    try {
      const updated = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, email: true, nombre: true, apellido: true, telefono: true, avatarUrl: true },
      })

      return NextResponse.json(updated)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/perfil PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const setClauses: string[] = []
      const args: any[] = []
      if (body.nombre) { setClauses.push('nombre = ?'); args.push(body.nombre) }
      if (body.apellido !== undefined) { setClauses.push('apellido = ?'); args.push(body.apellido || null) }
      if (body.telefono !== undefined) { setClauses.push('telefono = ?'); args.push(body.telefono || null) }
      if (body.password) { setClauses.push('password = ?'); args.push(updateData.password) }
      if (body.avatarUrl !== undefined) { setClauses.push('avatarUrl = ?'); args.push(body.avatarUrl) }

      if (setClauses.length === 0) {
        return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
      }
      setClauses.push("updatedAt = datetime('now')")
      args.push(userId)

      await executeLibsql(`UPDATE User SET ${setClauses.join(', ')} WHERE id = ?`, args)

      const rows = await queryLibsql(
        'SELECT id, email, nombre, apellido, telefono, avatarUrl FROM User WHERE id = ?',
        [userId]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json(rows[0])
    }
  } catch (error) {
    console.error('Error en PATCH /api/vendedor/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
