import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/clientes/[id] — detalle del cliente
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
      const cliente = await db.contact.findUnique({
        where: { id },
        include: {
          owner: { select: { id: true, nombre: true, apellido: true, email: true, avatarUrl: true } },
          empresa: { select: { id: true, nombre: true } },
        },
      })
      if (!cliente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      const tareasCount = await db.tarea.count({ where: { contactoId: id } })
      return NextResponse.json({ ...cliente, _count: { tareas: tareasCount } })
    } catch (prismaErr) {
      console.warn('[admin/clientes/[id] GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const rows = await queryLibsql(
        `SELECT c.id, c.name, c.primaryEmail, c.primaryPhone, c.address, c.city, c.province, c.dni, c.notas,
                c.latitude, c.longitude, c.photoUrl, c.status, c.ownerId, c.empresaId, c.sourceReferrer,
                c.message, c.createdAt, c.updatedAt,
                u.nombre as ownerNombre, u.apellido as ownerApellido, u.email as ownerEmail, u.avatarUrl as ownerAvatarUrl,
                e.nombre as empresaNombre
         FROM Contact c
         LEFT JOIN User u ON c.ownerId = u.id
         LEFT JOIN Empresa e ON c.empresaId = e.id
         WHERE c.id = ?`,
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      const c = rows[0] as any
      c.owner = c.ownerId ? {
        id: c.ownerId, nombre: c.ownerNombre, apellido: c.ownerApellido,
        email: c.ownerEmail, avatarUrl: c.ownerAvatarUrl,
      } : null
      c.empresa = c.empresaId ? { id: c.empresaId, nombre: c.empresaNombre } : null
      c._count = { tareas: await scalarLibsql('SELECT COUNT(*) FROM Tarea WHERE contactoId = ?', [id]) }
      return NextResponse.json(c)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/clientes/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/admin/clientes/[id] — editar cliente
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
      const updated = await db.contact.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email !== undefined && { primaryEmail: body.email || null }),
          ...(body.telefono !== undefined && { primaryPhone: body.telefono || null }),
          ...(body.address !== undefined && { address: body.address || body.direccion || '' }),
          ...(body.ciudad !== undefined && { city: body.ciudad || null }),
          ...(body.provincia !== undefined && { province: body.provincia || null }),
          ...(body.dni !== undefined && { dni: body.dni || null }),
          ...(body.notas !== undefined && { notas: body.notas || null }),
          ...(body.latitude !== undefined && body.latitude !== null && { latitude: Number(body.latitude) }),
          ...(body.longitude !== undefined && body.longitude !== null && { longitude: Number(body.longitude) }),
          ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl }),
          ...(body.ownerId !== undefined && { ownerId: body.ownerId || '' }),
          ...(body.vendedorId !== undefined && { ownerId: body.vendedorId || '' }),
          ...(body.empresaId !== undefined && { empresaId: body.empresaId || null }),
          ...(body.status !== undefined && { status: body.status }),
        },
      })
      return NextResponse.json(updated)
    } catch (prismaErr) {
      console.warn('[admin/clientes/[id] PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const setClauses: string[] = []
      const args: any[] = []
      if (body.name) { setClauses.push('name = ?'); args.push(body.name) }
      if (body.email !== undefined) { setClauses.push('primaryEmail = ?'); args.push(body.email || null) }
      if (body.telefono !== undefined) { setClauses.push('primaryPhone = ?'); args.push(body.telefono || null) }
      if (body.address !== undefined) { setClauses.push('address = ?'); args.push(body.address || '') }
      if (body.ciudad !== undefined) { setClauses.push('city = ?'); args.push(body.ciudad || null) }
      if (body.provincia !== undefined) { setClauses.push('province = ?'); args.push(body.provincia || null) }
      if (body.dni !== undefined) { setClauses.push('dni = ?'); args.push(body.dni || null) }
      if (body.notas !== undefined) { setClauses.push('notas = ?'); args.push(body.notas || null) }
      if (body.latitude !== undefined) { setClauses.push('latitude = ?'); args.push(body.latitude !== null ? Number(body.latitude) : null) }
      if (body.longitude !== undefined) { setClauses.push('longitude = ?'); args.push(body.longitude !== null ? Number(body.longitude) : null) }
      if (body.photoUrl !== undefined) { setClauses.push('photoUrl = ?'); args.push(body.photoUrl) }
      if (body.ownerId !== undefined) { setClauses.push('ownerId = ?'); args.push(body.ownerId || '') }
      if (body.vendedorId !== undefined) { setClauses.push('ownerId = ?'); args.push(body.vendedorId || '') }
      if (body.empresaId !== undefined) { setClauses.push('empresaId = ?'); args.push(body.empresaId || null) }
      if (body.status !== undefined) { setClauses.push('status = ?'); args.push(body.status) }

      if (setClauses.length === 0) return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
      setClauses.push("updatedAt = datetime('now')")
      args.push(id)

      const affected = await executeLibsql(`UPDATE Contact SET ${setClauses.join(', ')} WHERE id = ?`, args)
      if (affected === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ id, ...body })
    }
  } catch (error) {
    console.error('Error en PATCH /api/admin/clientes/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/clientes/[id] — eliminar cliente
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // Verificar FK: si tiene tareas asignadas, no eliminar
    const tareasCount = await scalarLibsql('SELECT COUNT(*) FROM Tarea WHERE contactoId = ?', [id]).catch(() => 0)
    if (tareasCount > 0) {
      return NextResponse.json({
        error: `No se puede eliminar: el cliente tiene ${tareasCount} tareas asignadas. Reasigna primero o elimina las tareas.`
      }, { status: 409 })
    }

    // === INTENTO 1: Prisma ===
    try {
      await db.contact.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    } catch (prismaErr) {
      console.warn('[admin/clientes/[id] DELETE] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const affected = await executeLibsql('DELETE FROM Contact WHERE id = ?', [id])
      if (affected === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }
  } catch (error) {
    console.error('Error en DELETE /api/admin/clientes/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
