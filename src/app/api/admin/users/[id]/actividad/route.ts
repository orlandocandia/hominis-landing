import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id]/actividad — obtener actividad reciente del vendedor
// Incluye: tareas completadas, contactos creados, notificaciones, ultimo acceso.
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
      // Tareas completadas recientemente
      const tareasCompletadas = await db.tarea.findMany({
        where: { asignadoA: id, estado: 'COMPLETADA' },
        orderBy: { fechaCompletada: 'desc' },
        select: { id: true, titulo: true, tipo: true, fechaCompletada: true, createdAt: true },
        take: 10,
      })

      // Contactos creados/actualizados recientemente
      const contactosRecientes = await db.contact.findMany({
        where: { ownerId: id },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, status: true, updatedAt: true },
        take: 10,
      })

      // Notificaciones del usuario
      const notificaciones = await db.notification.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, message: true, read: true, createdAt: true },
        take: 10,
      })

      // Datos del usuario (ultimo acceso)
      const user = await db.user.findUnique({
        where: { id },
        select: { id: true, email: true, nombre: true, ultimoAcceso: true, createdAt: true },
      })

      // Construir timeline de actividad (mezclar y ordenar por fecha)
      type Actividad = {
        tipo: 'tarea' | 'contacto' | 'notificacion' | 'login'
        titulo: string
        fecha: Date | null
        detalle?: string | null
      }

      const actividades: Actividad[] = []

      // Login (ultimo acceso)
      if (user?.ultimoAcceso) {
        actividades.push({
          tipo: 'login',
          titulo: 'Inicio de sesión',
          fecha: user.ultimoAcceso,
          detalle: 'Acceso al sistema',
        })
      }

      // Tareas completadas
      for (const t of tareasCompletadas) {
        actividades.push({
          tipo: 'tarea',
          titulo: `Tarea completada: ${t.titulo}`,
          fecha: t.fechaCompletada,
          detalle: t.tipo,
        })
      }

      // Contactos actualizados
      for (const c of contactosRecientes) {
        actividades.push({
          tipo: 'contacto',
          titulo: `Lead actualizado: ${c.name}`,
          fecha: c.updatedAt,
          detalle: `Estado: ${c.status}`,
        })
      }

      // Notificaciones
      for (const n of notificaciones) {
        actividades.push({
          tipo: 'notificacion',
          titulo: n.title,
          fecha: n.createdAt,
          detalle: n.message,
        })
      }

      // Ordenar por fecha descendente (mas reciente primero)
      actividades.sort((a, b) => {
        const fa = a.fecha ? new Date(a.fecha).getTime() : 0
        const fb = b.fecha ? new Date(b.fecha).getTime() : 0
        return fb - fa
      })

      return NextResponse.json({
        user: user ? {
          ...user,
          ultimoAcceso: user.ultimoAcceso ? new Date(user.ultimoAcceso).toISOString() : null,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
        } : null,
        actividades: actividades.slice(0, 30).map((a) => ({
          ...a,
          fecha: a.fecha ? new Date(a.fecha).toISOString() : null,
        })),
      })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id]/actividad] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Datos del usuario
      const userRows = await queryLibsql(
        'SELECT id, email, nombre, ultimoAcceso, createdAt FROM User WHERE id = ?',
        [id]
      )

      if (userRows.length === 0) {
        return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      }

      const userRow = userRows[0] as any

      // Tareas completadas
      const tareasCompletadas = await queryLibsql(
        `SELECT id, titulo, tipo, fechaCompletada, createdAt FROM Tarea WHERE asignadoA = ? AND estado = 'COMPLETADA' ORDER BY fechaCompletada DESC LIMIT 10`,
        [id]
      )

      // Contactos recientes
      const contactosRecientes = await queryLibsql(
        `SELECT id, name, status, updatedAt FROM Contact WHERE ownerId = ? ORDER BY updatedAt DESC LIMIT 10`,
        [id]
      )

      // Notificaciones
      const notificaciones = await queryLibsql(
        `SELECT id, title, message, read, createdAt FROM Notification WHERE userId = ? ORDER BY createdAt DESC LIMIT 10`,
        [id]
      )

      // Construir timeline
      type Actividad = {
        tipo: 'tarea' | 'contacto' | 'notificacion' | 'login'
        titulo: string
        fecha: string | null
        detalle?: string | null
      }

      const actividades: Actividad[] = []

      if (userRow.ultimoAcceso) {
        actividades.push({
          tipo: 'login',
          titulo: 'Inicio de sesión',
          fecha: userRow.ultimoAcceso,
          detalle: 'Acceso al sistema',
        })
      }

      for (const t of tareasCompletadas) {
        actividades.push({
          tipo: 'tarea',
          titulo: `Tarea completada: ${(t as any).titulo}`,
          fecha: (t as any).fechaCompletada,
          detalle: (t as any).tipo,
        })
      }

      for (const c of contactosRecientes) {
        actividades.push({
          tipo: 'contacto',
          titulo: `Lead actualizado: ${(c as any).name}`,
          fecha: (c as any).updatedAt,
          detalle: `Estado: ${(c as any).status}`,
        })
      }

      for (const n of notificaciones) {
        actividades.push({
          tipo: 'notificacion',
          titulo: (n as any).title,
          fecha: (n as any).createdAt,
          detalle: (n as any).message,
        })
      }

      // Ordenar por fecha (convierte a timestamp para comparar)
      actividades.sort((a, b) => {
        const fa = a.fecha ? new Date(a.fecha).getTime() : 0
        const fb = b.fecha ? new Date(b.fecha).getTime() : 0
        return fb - fa
      })

      return NextResponse.json({
        user: {
          id: userRow.id,
          email: userRow.email,
          nombre: userRow.nombre,
          ultimoAcceso: userRow.ultimoAcceso ? new Date(userRow.ultimoAcceso).toISOString() : null,
          createdAt: userRow.createdAt ? new Date(userRow.createdAt).toISOString() : null,
        },
        actividades: actividades.slice(0, 30).map((a) => ({
          ...a,
          fecha: a.fecha ? new Date(a.fecha).toISOString() : null,
        })),
      })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]/actividad:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
