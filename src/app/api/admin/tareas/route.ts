import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/tareas?page=1&limit=20&estado=&asignadoA=
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const estado = searchParams.get('estado') || ''
    const asignadoA = searchParams.get('asignadoA') || ''

    const where: any = {}
    if (estado) where.estado = estado
    if (asignadoA) where.asignadoA = asignadoA

    const [tareas, total] = await Promise.all([
      db.tarea.findMany({
        where,
        orderBy: { fechaLimite: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          vendedor: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
      db.tarea.count({ where }),
    ])

    return NextResponse.json({ tareas, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    // Fallback: libsql directo
    console.warn('[tareas GET] Prisma fallo, usando fallback libsql. Error:', (error as Error)?.message?.slice(0, 150))

    const conditions: string[] = []
    const args: any[] = []
    if (estado) { conditions.push('estado = ?'); args.push(estado) }
    if (asignadoA) { conditions.push('asignadoA = ?'); args.push(asignadoA) }
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    const tareasRaw = await queryLibsql(
      `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.fechaLimite, t.fechaCompletada, t.asignadoA, t.contactoId, t.createdAt,
              u.nombre as vendedorNombre, u.apellido as vendedorApellido, u.email as vendedorEmail
       FROM Tarea t
       LEFT JOIN User u ON t.asignadoA = u.id
       ${whereClause}
       ORDER BY t.fechaLimite ASC
       LIMIT ? OFFSET ?`,
      [...args, limit, (page - 1) * limit]
    )

    const tareas = tareasRaw.map((t: any) => ({
      id: t.id, titulo: t.titulo, descripcion: t.descripcion, tipo: t.tipo, estado: t.estado,
      fechaLimite: t.fechaLimite ? new Date(t.fechaLimite).toISOString() : null,
      fechaCompletada: t.fechaCompletada ? new Date(t.fechaCompletada).toISOString() : null,
      asignadoA: t.asignadoA, contactoId: t.contactoId,
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : null,
      vendedor: { id: t.asignadoA, nombre: t.vendedorNombre, apellido: t.vendedorApellido, email: t.vendedorEmail },
    }))

    const total = await queryLibsql(`SELECT COUNT(*) as n FROM Tarea ${whereClause}`, args)
    const totalCount = (total[0] as any)?.n || 0

    return NextResponse.json({ tareas, total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) })
  }
}

// POST /api/admin/tareas — crear tarea (con fallback libsql + notificacion al vendedor)
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    let userId = (session.user as any).id as string

    // FIX: si el userId es 'admin-hardcodeado' (no existe en Turso), buscar un admin real
    if (userId === 'admin-hardcodeado') {
      try {
        const admins = await queryLibsql("SELECT id FROM User WHERE rol = 'ADMIN' LIMIT 1")
        if (admins.length > 0) {
          userId = (admins[0] as any).id
        }
      } catch {}
    }

    if (!body.titulo || !body.asignadoA || !body.fechaLimite) {
      return NextResponse.json({ error: 'Faltan campos (titulo, asignadoA, fechaLimite)' }, { status: 400 })
    }

    // === INTENTO 1: Prisma ===
    try {
      const tarea = await db.tarea.create({
        data: {
          titulo: body.titulo,
          descripcion: body.descripcion || null,
          tipo: body.tipo || 'TAREA',
          estado: 'PENDIENTE',
          fechaLimite: new Date(body.fechaLimite),
          asignadoA: body.asignadoA,
          asignadoPor: userId,
          contactoId: body.contactoId || null,
        },
      })

      // Notificar al vendedor asignado (best-effort)
      try {
        await db.notification.create({
          data: {
            userId: body.asignadoA,
            type: 'ASSIGNMENT',
            title: 'Nueva tarea asignada',
            message: body.titulo,
            link: '/vendedor/tareas',
          },
        })
      } catch (notifErr) {
        console.warn('[tareas POST] No se pudo crear notificacion:', (notifErr as Error)?.message?.slice(0, 100))
      }

      return NextResponse.json(tarea, { status: 201 })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[tareas POST] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const tareaId = 'tarea_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      await executeLibsql(
        `INSERT INTO Tarea (id, titulo, descripcion, tipo, estado, fechaLimite, asignadoA, asignadoPor, contactoId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [tareaId, body.titulo, body.descripcion || null, body.tipo || 'TAREA',
         new Date(body.fechaLimite).toISOString(), body.asignadoA, userId, body.contactoId || null]
      )

      // Notificar al vendedor (best-effort, via libsql)
      try {
        await executeLibsql(
          `INSERT INTO Notification (id, userId, type, title, message, link, read, createdAt)
           VALUES (?, ?, 'ASSIGNMENT', 'Nueva tarea asignada', ?, '/vendedor/tareas', 0, datetime('now'))`,
          ['notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), body.asignadoA, body.titulo]
        )
      } catch (notifErr) {
        console.warn('[tareas POST] No se pudo crear notificacion via libsql:', (notifErr as Error)?.message?.slice(0, 100))
      }

      return NextResponse.json({ id: tareaId, ...body, estado: 'PENDIENTE' }, { status: 201 })
    }
  } catch (error) {
    console.error('Error en POST /api/admin/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
