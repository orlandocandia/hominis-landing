import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads?page=1&limit=20&origen=&estado=
// Lista paginada de leads (tabla Contacto — legacy landing leads).
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const origen = searchParams.get('origen') || ''
    const estado = searchParams.get('estado') || ''

    // Build where clause
    const where: any = {}
    if (origen) where.origen = origen
    if (estado) where.estado = estado

    const [leads, total] = await Promise.all([
      db.contacto.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contacto.count({ where }),
    ])

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error en GET /api/admin/leads:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
