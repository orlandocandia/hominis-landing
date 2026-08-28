import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scalarLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats/equipo
// Estadísticas del dashboard: total vendedores, leads, tareas, notificaciones.
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function GET() {
  try {
    const session = await requireAuth()

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = (session.user as any).id as string

    // === INTENTO 1: Prisma ===
    try {
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
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/stats/equipo] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const [totalVendedores, totalLeads, totalTareas, notificacionesNoLeidas] = await Promise.all([
        scalarLibsql("SELECT COUNT(*) FROM User WHERE rol = 'VENDEDOR' AND activo = 1"),
        scalarLibsql('SELECT COUNT(*) FROM Contact'),
        scalarLibsql("SELECT COUNT(*) FROM Tarea WHERE estado = 'PENDIENTE'"),
        scalarLibsql('SELECT COUNT(*) FROM Notification WHERE userId = ? AND read = 0', [userId]),
      ])

      return NextResponse.json({
        totalVendedores,
        totalLeads,
        totalTareas,
        notificacionesNoLeidas,
      })
    }
  } catch (error) {
    console.error('[Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
