import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/admin/users?role=VENDEDOR
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || ''

    const where = role ? { rol: role } : {}
    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, email: true, nombre: true, apellido: true,
        rol: true, activo: true, avatarUrl: true, coverageAreas: true,
        telefono: true, ultimoAcceso: true, createdAt: true,
      },
    })

    // Build metrics
    const withMetrics = await Promise.all(
      users.map(async (u) => {
        const [contacts, tareasPendientes] = await Promise.all([
          db.contact.count({ where: { ownerId: u.id } }),
          db.tarea.count({ where: { asignadoA: u.id, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
        ])
        return {
          ...u,
          _count: { contacts, tareasPendientes },
        }
      })
    )

    return NextResponse.json(withMetrics)
  } catch (error) {
    console.error('Error en GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/users — crear vendedor
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    if (!body.email || !body.nombre || !body.password) {
      return NextResponse.json({ error: 'Faltan campos (nombre, email, password)' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const user = await db.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        nombre: body.nombre,
        apellido: body.apellido || null,
        telefono: body.telefono || null,
        rol: body.rol || 'VENDEDOR',
        activo: true,
        coverageAreas: body.coverageAreas ? JSON.stringify(body.coverageAreas) : null,
      },
      select: {
        id: true, email: true, nombre: true, apellido: true, rol: true, activo: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
