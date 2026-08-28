import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/clientes/[id]/tareas — tareas asignadas a este cliente
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    try {
      const tareas = await db.tarea.findMany({
        where: { contactoId: id },
        orderBy: { fechaLimite: 'asc' },
        include: {
          vendedor: { select: { id: true, nombre: true, apellido: true } },
        },
        take: 50,
      })
      return NextResponse.json(tareas)
    } catch (prismaErr) {
      console.warn('[admin/clientes/[id]/tareas] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const tareas = await queryLibsql(
        `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.fechaLimite, t.fechaCompletada, t.createdAt,
                u.nombre as vendedorNombre, u.apellido as vendedorApellido
         FROM Tarea t
         LEFT JOIN User u ON t.asignadoA = u.id
         WHERE t.contactoId = ?
         ORDER BY t.fechaLimite ASC LIMIT 50`,
        [id]
      )
      const formatted = tareas.map((t: any) => ({
        id: t.id, titulo: t.titulo, descripcion: t.descripcion, tipo: t.tipo,
        estado: t.estado,
        fechaLimite: t.fechaLimite ? new Date(t.fechaLimite).toISOString() : null,
        fechaCompletada: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
        vendedor: { nombre: t.vendedorNombre, apellido: t.vendedorApellido },
      }))
      return NextResponse.json(formatted)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/clientes/[id]/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
