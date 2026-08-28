import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { scalarLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let userId = (session.user as any).id as string

    // Si el userId es 'admin-hardcodeado', devolver ceros (el admin no tiene tareas como vendedor)
    if (userId === 'admin-hardcodeado') {
      return NextResponse.json({ tareasPendientes: 0, tareasTotal: 0, leadsTotal: 0, leadsNuevos: 0 })
    }

    // === INTENTO 1: Prisma ===
    try {
      const [tareasPendientes, tareasTotal, leadsTotal, leadsNuevos] = await Promise.all([
        db.tarea.count({ where: { asignadoA: userId, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
        db.tarea.count({ where: { asignadoA: userId } }),
        db.contact.count({ where: { ownerId: userId } }),
        db.contact.count({ where: { ownerId: userId, status: 'NUEVO' } }),
      ])

      return NextResponse.json({ tareasPendientes, tareasTotal, leadsTotal, leadsNuevos })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/stats GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const [tareasPendientes, tareasTotal, leadsTotal, leadsNuevos] = await Promise.all([
        scalarLibsql("SELECT COUNT(*) FROM Tarea WHERE asignadoA = ? AND estado IN ('PENDIENTE', 'EN_PROGRESO')", [userId]),
        scalarLibsql('SELECT COUNT(*) FROM Tarea WHERE asignadoA = ?', [userId]),
        scalarLibsql('SELECT COUNT(*) FROM Contact WHERE ownerId = ?', [userId]),
        scalarLibsql("SELECT COUNT(*) FROM Contact WHERE ownerId = ? AND status = 'NUEVO'", [userId]),
      ])

      return NextResponse.json({ tareasPendientes, tareasTotal, leadsTotal, leadsNuevos })
    }
  } catch (error) {
    console.error('Error en GET /api/vendedor/stats:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
