import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/tareas?page=1&limit=20&estado=&asignadoA=
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const estado = searchParams.get('estado') || ''
    const asignadoA = searchParams.get('asignadoA') || ''

    const where: any = {}
    if (estado) where.estado = estado
    if (asignadoA) where.asignadoA = asignadoA

    const [tareas, total] = await Promise.all([
      db.tarea.findMany({
        where,
        orderBy: { fechaLimite: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          vendedor: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
      db.tarea.count({ where }),
    ])

    return NextResponse.json({ tareas, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error en GET /api/admin/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/tareas — crear tarea
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const userId = (session.user as any).id as string

    if (!body.titulo || !body.asignadoA || !body.fechaLimite) {
      return NextResponse.json({ error: 'Faltan campos (titulo, asignadoA, fechaLimite)' }, { status: 400 })
    }

    const tarea = await db.tarea.create({
      data: {
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        tipo: body.tipo || 'TAREA',
        estado: 'PENDIENTE',
        fechaLimite: new Date(body.fechaLimite),
        asignadoA: body.asignadoA,
        asignadoPor: userId,
        contactoId: body.contactoId || null,
      },
    })

    return NextResponse.json(tarea, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
