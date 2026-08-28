import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// POST /api/admin/leads/bulk — acciones masivas sobre múltiples leads
//
// Body:
//   { action: 'markRead', ids: ['id1', 'id2', ...] }    → marcar como LEIDO
//   { action: 'delete', ids: ['id1', 'id2', ...] }      → eliminar leads
//   { action: 'updateStatus', ids: [...], status: 'ATENDIDO' } → cambiar estado
//
// Respuesta: { success: true, affected: <número de leads afectados> }
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { action, ids, status } = body

    // Validar ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de IDs no vacío' }, { status: 400 })
    }

    // Validar acción
    const validActions = ['markRead', 'delete', 'updateStatus']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    // Validar estado si es updateStatus
    const validStatuses = ['NUEVO', 'LEIDO', 'EN_CONTACTO', 'REUNION', 'PRESUPUESTO', 'ATENDIDO', 'RECHAZADO']
    if (action === 'updateStatus') {
      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
    }

    // === INTENTO 1: Prisma ===
    try {
      if (action === 'markRead') {
        const result = await db.contact.updateMany({
          where: { id: { in: ids } },
          data: { status: 'LEIDO' },
        })
        return NextResponse.json({ success: true, affected: result.count })
      } else if (action === 'updateStatus') {
        const result = await db.contact.updateMany({
          where: { id: { in: ids } },
          data: { status },
        })
        return NextResponse.json({ success: true, affected: result.count })
      } else if (action === 'delete') {
        const result = await db.contact.deleteMany({
          where: { id: { in: ids } },
        })
        return NextResponse.json({ success: true, affected: result.count })
      }
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/leads/bulk] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Construir placeholders para IN clause: (?, ?, ...)
      const placeholders = ids.map(() => '?').join(', ')

      if (action === 'markRead') {
        const affected = await executeLibsql(
          `UPDATE Contact SET status = 'LEIDO', updatedAt = datetime('now') WHERE id IN (${placeholders})`,
          ids
        )
        return NextResponse.json({ success: true, affected })
      } else if (action === 'updateStatus') {
        const affected = await executeLibsql(
          `UPDATE Contact SET status = ?, updatedAt = datetime('now') WHERE id IN (${placeholders})`,
          [status, ...ids]
        )
        return NextResponse.json({ success: true, affected })
      } else if (action === 'delete') {
        const affected = await executeLibsql(
          `DELETE FROM Contact WHERE id IN (${placeholders})`,
          ids
        )
        return NextResponse.json({ success: true, affected })
      }
    }

    return NextResponse.json({ error: 'Acción no soportada' }, { status: 400 })
  } catch (error) {
    console.error('Error en POST /api/admin/leads/bulk:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
