import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let userId = (session.user as any).id as string
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // === INTENTO 1: Prisma ===
    try {
      // Verify ownership
      const tarea = await db.tarea.findUnique({ where: { id } })
      if (!tarea || tarea.asignadoA !== userId) {
        return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
      }

      const updated = await db.tarea.update({
        where: { id },
        data: {
          ...(body.estado && { estado: body.estado }),
          ...(body.estado === 'COMPLETADA' && { fechaCompletada: new Date() }),
        },
      })

      // Notify admin (best-effort)
      try {
        const admin = await db.user.findFirst({ where: { rol: 'ADMIN' }, select: { id: true } })
        if (admin) {
          await db.notification.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: 'Tarea completada',
              message: `${session.user?.name || 'Vendedor'} completó: ${tarea.titulo}`,
              link: '/admin/tareas',
            },
          })
        }
      } catch {}

      return NextResponse.json(updated)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/tareas/[id] PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Verify ownership via libsql
      const rows = await queryLibsql('SELECT id, titulo, asignadoA FROM Tarea WHERE id = ?', [id])
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
      const tarea = rows[0] as any
      if (tarea.asignadoA !== userId) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

      // Update via libsql
      const setClauses: string[] = []
      const args: any[] = []
      if (body.estado) { setClauses.push('estado = ?'); args.push(body.estado) }
      if (body.estado === 'COMPLETADA') { setClauses.push("fechaCompletada = datetime('now')") }
      setClauses.push("updatedAt = datetime('now')")
      args.push(id)

      await executeLibsql(`UPDATE Tarea SET ${setClauses.join(', ')} WHERE id = ?`, args)

      // Notify admin (best-effort, via libsql)
      try {
        const admins = await queryLibsql("SELECT id FROM User WHERE rol = 'ADMIN' LIMIT 1")
        if (admins.length > 0) {
          const adminId = (admins[0] as any).id
          await executeLibsql(
            `INSERT INTO Notification (id, userId, type, title, message, link, read, createdAt)
             VALUES (?, ?, 'SYSTEM', 'Tarea completada', ?, '/admin/tareas', 0, datetime('now'))`,
            ['notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), adminId,
             `${session.user?.name || 'Vendedor'} completó: ${tarea.titulo}`]
          )
        }
      } catch {}

      return NextResponse.json({ id, ...body })
    }
  } catch (error) {
    console.error('Error en PATCH /api/vendedor/tareas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
