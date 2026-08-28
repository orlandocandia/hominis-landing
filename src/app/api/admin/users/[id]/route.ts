import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id] — obtener datos del vendedor (detalle) + métricas
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
      const user = await db.user.findUnique({
        where: { id },
        select: {
          id: true, email: true, nombre: true, apellido: true,
          rol: true, activo: true, avatarUrl: true, coverageAreas: true,
          telefono: true, ultimoAcceso: true, createdAt: true,
          // NUEVO: campos logisticos
          documentNumber: true, province: true, city: true, address: true,
          latitude: true, longitude: true, horario: true, hireDate: true,
        },
      })

      if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      const [contacts, tareasPendientes, totalTareas] = await Promise.all([
        db.contact.count({ where: { ownerId: id } }),
        db.tarea.count({ where: { asignadoA: id, estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } } }),
        db.tarea.count({ where: { asignadoA: id } }),
      ])

      return NextResponse.json({ ...user, _count: { contacts, tareasPendientes, totalTareas } })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id] GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const rows = await queryLibsql(
        `SELECT id, email, nombre, apellido, rol, activo, avatarUrl, coverageAreas, telefono, ultimoAcceso, createdAt,
                documentNumber, province, city, address, latitude, longitude, horario, hireDate
         FROM User WHERE id = ?`,
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      const user = rows[0] as any
      user.activo = user.activo === 1 || user.activo === true
      user.ultimoAcceso = user.ultimoAcceso ? new Date(user.ultimoAcceso).toISOString() : null
      user.createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : null
      user.hireDate = user.hireDate ? new Date(user.hireDate).toISOString() : null  // NUEVO

      const [contacts, tareasPendientes, totalTareas] = await Promise.all([
        scalarLibsql('SELECT COUNT(*) FROM Contact WHERE ownerId = ?', [id]),
        scalarLibsql("SELECT COUNT(*) FROM Tarea WHERE asignadoA = ? AND estado IN ('PENDIENTE','EN_PROGRESO')", [id]),
        scalarLibsql('SELECT COUNT(*) FROM Tarea WHERE asignadoA = ?', [id]),
      ])

      return NextResponse.json({ ...user, _count: { contacts, tareasPendientes, totalTareas } })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id] — actualizar datos del vendedor (nombre, email, activo, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // === INTENTO 1: Prisma ===
    try {
      const updated = await db.user.update({
        where: { id },
        data: {
          ...(body.nombre && { nombre: body.nombre }),
          ...(body.apellido !== undefined && { apellido: body.apellido }),
          ...(body.email && { email: body.email }),
          ...(body.telefono !== undefined && { telefono: body.telefono }),
          ...(body.activo !== undefined && { activo: body.activo }),
          ...(body.coverageAreas !== undefined && { coverageAreas: Array.isArray(body.coverageAreas) ? body.coverageAreas.join(', ') : (body.coverageAreas || null) }),
          ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),  // foto (preservado)
          // NUEVO: campos logisticos
          ...(body.documentNumber !== undefined && { documentNumber: body.documentNumber || body.dni || null }),
          ...(body.dni !== undefined && { documentNumber: body.dni }),
          ...(body.province !== undefined && { province: body.province }),
          ...(body.city !== undefined && { city: body.city }),
          ...(body.address !== undefined && { address: body.address || body.direccion }),
          ...(body.direccion !== undefined && { address: body.direccion }),
          ...(body.latitude !== undefined && body.latitude !== null && { latitude: Number(body.latitude) }),
          ...(body.longitude !== undefined && body.longitude !== null && { longitude: Number(body.longitude) }),
          ...(body.horario !== undefined && { horario: body.horario }),
          ...(body.hireDate !== undefined && { hireDate: body.hireDate ? new Date(body.hireDate) : null }),
          ...(body.fechaIngreso !== undefined && { hireDate: body.fechaIngreso ? new Date(body.fechaIngreso) : null }),
        },
        select: {
          id: true, email: true, nombre: true, apellido: true, rol: true, activo: true, avatarUrl: true,
          documentNumber: true, province: true, city: true, address: true,
          latitude: true, longitude: true, coverageAreas: true, horario: true, hireDate: true,
        },
      })

      return NextResponse.json(updated)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id] PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Construir SET clause dinamicamente
      const setClauses: string[] = []
      const args: any[] = []
      if (body.nombre) { setClauses.push('nombre = ?'); args.push(body.nombre) }
      if (body.apellido !== undefined) { setClauses.push('apellido = ?'); args.push(body.apellido || null) }
      if (body.email) { setClauses.push('email = ?'); args.push(body.email) }
      if (body.telefono !== undefined) { setClauses.push('telefono = ?'); args.push(body.telefono || null) }
      if (body.activo !== undefined) { setClauses.push('activo = ?'); args.push(body.activo ? 1 : 0) }
      if (body.coverageAreas !== undefined) {
        const cov = Array.isArray(body.coverageAreas) ? body.coverageAreas.join(', ') : body.coverageAreas
        setClauses.push('coverageAreas = ?'); args.push(cov)
      }
      if (body.avatarUrl !== undefined) { setClauses.push('avatarUrl = ?'); args.push(body.avatarUrl) }  // foto (preservado)
      // NUEVO: campos logisticos
      if (body.documentNumber !== undefined) { setClauses.push('documentNumber = ?'); args.push(body.documentNumber || null) }
      if (body.dni !== undefined) { setClauses.push('documentNumber = ?'); args.push(body.dni || null) }
      if (body.province !== undefined) { setClauses.push('province = ?'); args.push(body.province || null) }
      if (body.city !== undefined) { setClauses.push('city = ?'); args.push(body.city || null) }
      if (body.address !== undefined) { setClauses.push('address = ?'); args.push(body.address || null) }
      if (body.direccion !== undefined) { setClauses.push('address = ?'); args.push(body.direccion || null) }
      if (body.latitude !== undefined) { setClauses.push('latitude = ?'); args.push(body.latitude !== null ? Number(body.latitude) : null) }
      if (body.longitude !== undefined) { setClauses.push('longitude = ?'); args.push(body.longitude !== null ? Number(body.longitude) : null) }
      if (body.horario !== undefined) { setClauses.push('horario = ?'); args.push(body.horario || null) }
      if (body.hireDate !== undefined) { setClauses.push('hireDate = ?'); args.push(body.hireDate ? new Date(body.hireDate).toISOString() : null) }
      if (body.fechaIngreso !== undefined) { setClauses.push('hireDate = ?'); args.push(body.fechaIngreso ? new Date(body.fechaIngreso).toISOString() : null) }

      if (setClauses.length === 0) {
        return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
      }
      setClauses.push("updatedAt = datetime('now')")
      args.push(id)

      const affected = await executeLibsql(
        `UPDATE User SET ${setClauses.join(', ')} WHERE id = ?`,
        args
      )

      if (affected === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      // Devolver el usuario actualizado (incluye campos logisticos)
      const rows = await queryLibsql(
        `SELECT id, email, nombre, apellido, rol, activo, avatarUrl, documentNumber, province, city, address,
                latitude, longitude, coverageAreas, horario, hireDate FROM User WHERE id = ?`,
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      const user = rows[0] as any
      user.activo = user.activo === 1 || user.activo === true
      user.hireDate = user.hireDate ? new Date(user.hireDate).toISOString() : null
      return NextResponse.json(user)
    }
  } catch (error) {
    console.error('Error en PATCH /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — eliminar vendedor
// NOTA: No se puede eliminar un vendedor que tiene leads/tareas asignadas (FK RESTRICT).
// En ese caso, se devuelve error 409 con mensaje explicativo.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // No permitir eliminar el propio usuario (admin logueado)
    if ((session.user as any).id === id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
    }

    // === INTENTO 1: Prisma ===
    try {
      await db.user.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id] DELETE] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Verificar si el usuario tiene leads/tareas asignadas (FK RESTRICT)
      const contactCount = await scalarLibsql('SELECT COUNT(*) FROM Contact WHERE ownerId = ?', [id])
      const tareaCount = await scalarLibsql('SELECT COUNT(*) FROM Tarea WHERE asignadoA = ?', [id])

      if (contactCount > 0 || tareaCount > 0) {
        return NextResponse.json({
          error: `No se puede eliminar: el vendedor tiene ${contactCount} leads y ${tareaCount} tareas asignadas. Reasigna primero o desactiva el vendedor.`
        }, { status: 409 })
      }

      const affected = await executeLibsql('DELETE FROM User WHERE id = ?', [id])
      if (affected === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }
  } catch (error) {
    console.error('Error en DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
