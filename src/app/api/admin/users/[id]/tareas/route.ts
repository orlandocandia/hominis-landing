import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id]/tareas — obtener tareas asignadas a un vendedor
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // === INTENTO 1: Prisma ===
    try {
      const tareas = await db.tarea.findMany({
        where: { asignadoA: id },
        orderBy: { fechaLimite: 'asc' },
        include: {
          contacto: { select: { id: true, name: true, primaryEmail: true } },
          admin: { select: { id: true, nombre: true } },
        },
        take: 50,
      })
      return NextResponse.json(tareas)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id]/tareas] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const tareas = await queryLibsql(
        `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.fechaLimite, t.fechaCompletada, t.createdAt, t.updatedAt,
                c.id as contactoId, c.name as contactoName, c.primaryEmail as contactoEmail,
                u.id as adminId, u.nombre as adminNombre
         FROM Tarea t
         LEFT JOIN Contact c ON t.contactoId = c.id
         LEFT JOIN User u ON t.asignadoPor = u.id
         WHERE t.asignadoA = ?
         ORDER BY t.fechaLimite ASC
         LIMIT 50`,
        [id]
      )

      // Formatear fechas y estructura
      const tareasFormatted = tareas.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        descripcion: t.descripcion,
        tipo: t.tipo,
        estado: t.estado,
        fechaLimite: t.fechaLimite ? new Date(t.fechaLimite).toISOString() : null,
        fechaCompletada: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
        updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : null,
        contacto: t.contactoId ? {
          id: t.contactoId,
          name: t.contactoName,
          primaryEmail: t.contactoEmail,
        } : null,
        admin: t.adminId ? {
          id: t.adminId,
          nombre: t.adminNombre,
        } : null,
      }))

      return NextResponse.json(tareasFormatted)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
