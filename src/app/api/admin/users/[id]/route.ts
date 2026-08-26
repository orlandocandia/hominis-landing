import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id] — detalle de un vendedor con métricas
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
        avatarUrl: true,
        coverageAreas: true,
        telefono: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get metrics for this user
    const [contactsCount, tareasPendientes] = await Promise.all([
      db.contacto.count({
        where: { segmento: user.rol === 'ADMIN' ? undefined : 'premedic' },
      }),
      db.tarea.count({
        where: {
          asignadoA: id,
          estado: { in: ['PENDIENTE', 'EN_PROGRESO'] },
        },
      }),
    ])

    return NextResponse.json({
      ...user,
      _count: {
        contacts: contactsCount,
        tareasPendientes,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users/[id] — actualizar un vendedor
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.apellido && { apellido: body.apellido }),
        ...(body.email && { email: body.email }),
        ...(body.telefono && { telefono: body.telefono }),
        ...(body.activo !== undefined && { activo: body.activo }),
        ...(body.coverageAreas && { coverageAreas: JSON.stringify(body.coverageAreas) }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
      select: {
        id: true, email: true, nombre: true, apellido: true,
        rol: true, activo: true, avatarUrl: true, coverageAreas: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/admin/users/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
