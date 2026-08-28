import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql, executeLibsql } from '@/lib/libsql-db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/admin/users?role=VENDEDOR
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || ''

    // === INTENTO 1: Prisma ===
    try {
      const where = role ? { rol: role } : {}
      const users = await db.user.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, email: true, nombre: true, apellido: true,
          rol: true, activo: true, avatarUrl: true, coverageAreas: true,
          telefono: true, ultimoAcceso: true, createdAt: true,
        },
      })

      // Build metrics
      const withMetrics = await Promise.all(
        users.map(async (u) => {
          const [contacts, tareasPendientes] = await Promise.all([
            db.contact.count({ where: { ownerId: u.id } }),
            db.tarea.count({ where: { asignadoA: u.id, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
          ])
          return {
            ...u,
            _count: { contacts, tareasPendientes },
          }
        })
      )

      return NextResponse.json(withMetrics)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Consulta base de usuarios
      const usersSql = role
        ? `SELECT id, email, nombre, apellido, rol, activo, avatarUrl, coverageAreas, telefono, ultimoAcceso, createdAt
           FROM User WHERE rol = ? ORDER BY createdAt ASC`
        : `SELECT id, email, nombre, apellido, rol, activo, avatarUrl, coverageAreas, telefono, ultimoAcceso, createdAt
           FROM User ORDER BY createdAt ASC`
      const usersArgs = role ? [role] : []
      const users = await queryLibsql(usersSql, usersArgs)

      // Build metrics para cada usuario (count de contacts y tareas pendientes)
      const withMetrics = await Promise.all(
        users.map(async (u: any) => {
          const contacts = await scalarLibsql('SELECT COUNT(*) FROM Contact WHERE ownerId = ?', [u.id])
          const tareasPendientes = await scalarLibsql(
            "SELECT COUNT(*) FROM Tarea WHERE asignadoA = ? AND estado IN ('PENDIENTE', 'EN_PROGRESO')",
            [u.id]
          )
          return {
            ...u,
            activo: u.activo === 1 || u.activo === true, // SQLite devuelve 0/1
            _count: { contacts, tareasPendientes },
          }
        })
      )

      return NextResponse.json(withMetrics)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/users — crear vendedor
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    if (!body.email || !body.nombre || !body.password) {
      return NextResponse.json({ error: 'Faltan campos (nombre, email, password)' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    const rol = body.rol || 'VENDEDOR'
    const coverageAreas = body.coverageAreas ? JSON.stringify(body.coverageAreas) : null
    const avatarUrl = body.avatarUrl || null  // NUEVO: URL de foto de perfil (data URL base64)

    // === INTENTO 1: Prisma ===
    try {
      const user = await db.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          nombre: body.nombre,
          apellido: body.apellido || null,
          telefono: body.telefono || null,
          rol,
          activo: true,
          coverageAreas,
          ...(avatarUrl && { avatarUrl }),  // NUEVO: guardar avatarUrl si viene
        },
        select: {
          id: true, email: true, nombre: true, apellido: true, rol: true, activo: true, avatarUrl: true,
        },
      })

      return NextResponse.json(user, { status: 201 })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users POST] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Generar un ID unico
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

      await executeLibsql(
        `INSERT INTO User (id, email, password, nombre, apellido, telefono, rol, activo, coverageAreas, avatarUrl, fechaAlta, createdAt, updatedAt, geocodingStatus, intentosLogin, totalContacts, conversionRate, serviceRadius)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'), datetime('now'), datetime('now'), 'PENDING', 0, 0, 0, 50)`,
        [userId, body.email, hashedPassword, body.nombre, body.apellido || null, body.telefono || null, rol, coverageAreas, avatarUrl]
      )

      return NextResponse.json({
        id: userId,
        email: body.email,
        nombre: body.nombre,
        apellido: body.apellido || null,
        rol,
        activo: true,
        avatarUrl,  // NUEVO: devolver avatarUrl
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error en POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
