import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const { id } = await params
    const body = await request.json().catch(() => ({}))

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

    // Notify admin
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
  } catch (error) {
    console.error('Error en PATCH /api/vendedor/tareas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
