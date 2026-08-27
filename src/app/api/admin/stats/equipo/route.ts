import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    const [totalVendedores, totalLeads, totalTareas, notificacionesNoLeidas] = await Promise.all([
      db.user.count({ where: { rol: 'VENDEDOR', activo: true } }),
      db.contact.count(),
      db.tarea.count({ where: { estado: 'PENDIENTE' } }),
      db.notification.count({ where: { userId, read: false } }),
    ])

    return NextResponse.json({
      totalVendedores,
      totalLeads,
      totalTareas,
      notificacionesNoLeidas,
    })
  } catch (error) {
    console.error('[Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
