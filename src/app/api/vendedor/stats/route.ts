import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string

    const [tareasPendientes, tareasTotal, leadsTotal, leadsNuevos] = await Promise.all([
      db.tarea.count({ where: { asignadoA: userId, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
      db.tarea.count({ where: { asignadoA: userId } }),
      db.contact.count({ where: { ownerId: userId } }),
      db.contact.count({ where: { ownerId: userId, status: 'NUEVO' } }),
    ])

    return NextResponse.json({ tareasPendientes, tareasTotal, leadsTotal, leadsNuevos })
  } catch (error) {
    console.error('Error en GET /api/vendedor/stats:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
