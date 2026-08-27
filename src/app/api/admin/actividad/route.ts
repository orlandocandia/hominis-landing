import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/admin/actividad?page=1&limit=20&userId=&action=
// Lista de actividades (ContactActivity) con filtros.
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || ''
    const action = searchParams.get('action') || ''

    const where: any = {}
    if (userId) where.userId = userId
    if (action) where.action = action

    const [actividades, total] = await Promise.all([
      db.contactActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
      db.contactActivity.count({ where }),
    ])

    return NextResponse.json({ actividades, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error en GET /api/admin/actividad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
