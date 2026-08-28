import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/clientes/[id]/actividad — actividad del cliente
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    try {
      const [contactActivities, tareasCompletadas, notificaciones] = await Promise.all([
        db.contactActivity.findMany({
          where: { contactId: id },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        db.tarea.findMany({
          where: { contactoId: id, estado: 'COMPLETADA' },
          orderBy: { fechaCompletada: 'desc' },
          select: { id: true, titulo: true, tipo: true, fechaCompletada: true },
          take: 10,
        }),
        db.notification.findMany({
          where: { userId: id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ])

      type Actividad = { tipo: string; titulo: string; fecha: string | null; detalle: string | null }
      const actividades: Actividad[] = []

      for (const a of contactActivities) {
        actividades.push({
          tipo: a.action,
          titulo: `Actividad: ${a.action}`,
          fecha: a.createdAt ? new Date(a.createdAt).toISOString() : null,
          detalle: a.note || null,
        })
      }
      for (const t of tareasCompletadas) {
        actividades.push({
          tipo: 'tarea',
          titulo: `Tarea completada: ${t.titulo}`,
          fecha: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
          detalle: t.tipo,
        })
      }
      for (const n of notificaciones) {
        actividades.push({
          tipo: 'notificacion',
          titulo: n.title,
          fecha: n.createdAt ? new Date(n.createdAt).toISOString() : null,
          detalle: n.message,
        })
      }

      actividades.sort((a, b) => {
        const fa = a.fecha ? new Date(a.fecha).getTime() : 0
        const fb = b.fecha ? new Date(b.fecha).getTime() : 0
        return fb - fa
      })

      return NextResponse.json({ actividades: actividades.slice(0, 30) })
    } catch (prismaErr) {
      console.warn('[admin/clientes/[id]/actividad] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const tareasCompletadas = await queryLibsql(
        "SELECT id, titulo, tipo, fechaCompletada FROM Tarea WHERE contactoId = ? AND estado = 'COMPLETADA' ORDER BY fechaCompletada DESC LIMIT 10",
        [id]
      )

      const actividades = tareasCompletadas.map((t: any) => ({
        tipo: 'tarea',
        titulo: `Tarea completada: ${t.titulo}`,
        fecha: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
        detalle: t.tipo,
      }))

      return NextResponse.json({ actividades })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/clientes/[id]/actividad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
