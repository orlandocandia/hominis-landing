import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/users?role=VENDEDOR
// Returns users with per-vendor metrics (contacts, atendidos, tareas pendientes)
//
// IMPORTANTE: el schema Prisma usa campos en español (rol, activo, nombre).
// Esta API mapea la respuesta a nombres en inglés (role, isActive, name) para
// compatibilidad con el frontend del dashboard que usa esa convención.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // VENDEDOR | ADMIN | PRODUCTOR

    // FIX: schema usa 'rol' (español), no 'role'
    const where = role ? { rol: role } : {}

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        nombre: true, // FIX: schema usa 'nombre', no 'name'
        rol: true, // FIX: schema usa 'rol', no 'role'
        activo: true, // FIX: schema usa 'activo', no 'isActive'
        avatarUrl: true,
        coverageAreas: true,
        createdAt: true,
      },
    })

    // Build metrics for each user
    const withMetrics = await Promise.all(
      users.map(async (u) => {
        // FIX: Contact model usa 'ownerId' (no 'vendedorId') y 'status' (no 'estado')
        const [contacts, atendidos, tareasPendientes] = await Promise.all([
          db.contact.count({ where: { ownerId: u.id } }),
          db.contact.count({
            where: {
              ownerId: u.id,
              // FIX: ContactStatus enum tiene ATENDIDO (no CONVERSION)
              status: { in: ['REUNION', 'PRESUPUESTO', 'ATENDIDO'] },
            },
          }),
          db.tarea.count({
            where: {
              // FIX: Tarea model usa 'asignadoA' (no 'asignadoAId')
              asignadoA: u.id,
              estado: { in: ['PENDIENTE', 'EN_PROGRESO'] },
            },
          }),
        ])

        // Mapear a nombres en inglés para compatibilidad con el frontend
        return {
          id: u.id,
          email: u.email,
          name: u.nombre, // mapear nombre -> name
          role: u.rol, // mapear rol -> role
          isActive: u.activo, // mapear activo -> isActive
          avatarUrl: u.avatarUrl,
          coverageAreas: u.coverageAreas,
          createdAt: u.createdAt,
          _count: {
            contacts,
            contactsAtendidos: atendidos,
            tareasPendientes,
          },
        }
      })
    )

    return NextResponse.json(withMetrics)
  } catch (error) {
    console.error('Error en /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detail: String(error) },
      { status: 500 }
    )
  }
}
