import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const tarea = await db.tarea.findUnique({
      where: { id },
      include: {
        vendedor: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    })

    if (!tarea) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    return NextResponse.json(tarea)
  } catch (error) {
    console.error('Error en GET /api/admin/tareas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const updated = await db.tarea.update({
      where: { id },
      data: {
        ...(body.titulo && { titulo: body.titulo }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.estado && { estado: body.estado }),
        ...(body.fechaLimite && { fechaLimite: new Date(body.fechaLimite) }),
        ...(body.asignadoA && { asignadoA: body.asignadoA }),
        ...(body.estado === 'COMPLETADA' && { fechaCompletada: new Date() }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/admin/tareas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    await db.tarea.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/admin/tareas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
