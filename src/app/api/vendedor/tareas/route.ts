import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let userId = (session.user as any).id as string

    // FIX: si el userId es 'admin-hardcodeado', no hay tareas que mostrar
    if (userId === 'admin-hardcodeado') {
      return NextResponse.json({ tareas: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''

    // === INTENTO 1: Prisma ===
    try {
      const where: any = { asignadoA: userId }
      if (estado) where.estado = estado

      const tareas = await db.tarea.findMany({
        where,
        orderBy: { fechaLimite: 'asc' },
      })

      return NextResponse.json({ tareas, total: tareas.length })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/tareas GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      let sql = 'SELECT id, titulo, descripcion, tipo, estado, fechaLimite, fechaCompletada, contactoId, createdAt, updatedAt FROM Tarea WHERE asignadoA = ?'
      const args: any[] = [userId]
      if (estado) {
        sql += ' AND estado = ?'
        args.push(estado)
      }
      sql += ' ORDER BY fechaLimite ASC'

      const tareas = await queryLibsql(sql, args)

      // Formatear fechas
      const tareasFormatted = tareas.map((t: any) => ({
        ...t,
        fechaLimite: t.fechaLimite ? new Date(t.fechaLimite).toISOString() : null,
        fechaCompletada: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
        updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : null,
      }))

      return NextResponse.json({ tareas: tareasFormatted, total: tareasFormatted.length })
    }
  } catch (error) {
    console.error('Error en GET /api/vendedor/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
