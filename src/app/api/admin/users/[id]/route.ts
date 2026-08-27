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
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, nombre: true, apellido: true,
        rol: true, activo: true, avatarUrl: true, coverageAreas: true,
        telefono: true, ultimoAcceso: true, createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const [contacts, tareasPendientes, totalTareas] = await Promise.all([
      db.contact.count({ where: { ownerId: id } }),
      db.tarea.count({ where: { asignadoA: id, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
      db.tarea.count({ where: { asignadoA: id } }),
    ])

    return NextResponse.json({ ...user, _count: { contacts, tareasPendientes, totalTareas } })
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]:', error)
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

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.apellido !== undefined && { apellido: body.apellido }),
        ...(body.email && { email: body.email }),
        ...(body.telefono !== undefined && { telefono: body.telefono }),
        ...(body.activo !== undefined && { activo: body.activo }),
        ...(body.coverageAreas && { coverageAreas: JSON.stringify(body.coverageAreas) }),
      },
      select: { id: true, email: true, nombre: true, apellido: true, rol: true, activo: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/admin/users/[id]:', error)
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
    await db.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
