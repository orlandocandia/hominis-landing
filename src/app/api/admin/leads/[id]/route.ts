import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads/[id] — obtener un lead por ID
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
      const lead = await db.contact.findUnique({ where: { id } })
      if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
      return NextResponse.json(lead)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/leads/[id] GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const rows = await queryLibsql(
        'SELECT id, name, primaryEmail, primaryPhone, address, message, status, sourceReferrer, sourceIp, ownerId, createdAt, updatedAt FROM Contact WHERE id = ?',
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
      const lead = rows[0] as any
      lead.createdAt = lead.createdAt ? new Date(lead.createdAt as string).toISOString() : null
      lead.updatedAt = lead.updatedAt ? new Date(lead.updatedAt as string).toISOString() : null
      return NextResponse.json(lead)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PATCH /api/admin/leads/[id] — actualizar estado (leído, en contacto, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // Validar estado si viene en el body
    const validStatuses = ['NUEVO', 'LEIDO', 'EN_CONTACTO', 'REUNION', 'PRESUPUESTO', 'ATENDIDO', 'RECHAZADO']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    // === INTENTO 1: Prisma ===
    try {
      const updated = await db.contact.update({
        where: { id },
        data: {
          ...(body.status && { status: body.status }),
          // NUEVO: campos logisticos del cliente (dni, provincia, ciudad, direccion, lat, lng)
          ...(body.dni !== undefined && { dni: body.dni || null }),
          ...(body.province !== undefined && { province: body.province || null }),
          ...(body.city !== undefined && { city: body.city || null }),
          ...(body.address !== undefined && { address: body.address || body.direccion || null }),
          ...(body.direccion !== undefined && { address: body.direccion || null }),
          ...(body.latitude !== undefined && body.latitude !== null && { latitude: Number(body.latitude) }),
          ...(body.longitude !== undefined && body.longitude !== null && { longitude: Number(body.longitude) }),
        },
      })
      return NextResponse.json(updated)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/leads/[id] PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Construir SET clause dinamicamente
      const setClauses: string[] = []
      const args: any[] = []
      if (body.status) { setClauses.push('status = ?'); args.push(body.status) }
      // NUEVO: campos logisticos
      if (body.dni !== undefined) { setClauses.push('dni = ?'); args.push(body.dni || null) }
      if (body.province !== undefined) { setClauses.push('province = ?'); args.push(body.province || null) }
      if (body.city !== undefined) { setClauses.push('city = ?'); args.push(body.city || null) }
      if (body.address !== undefined) { setClauses.push('address = ?'); args.push(body.address || null) }
      if (body.direccion !== undefined) { setClauses.push('address = ?'); args.push(body.direccion || null) }
      if (body.latitude !== undefined) { setClauses.push('latitude = ?'); args.push(body.latitude !== null ? Number(body.latitude) : null) }
      if (body.longitude !== undefined) { setClauses.push('longitude = ?'); args.push(body.longitude !== null ? Number(body.longitude) : null) }
      if (setClauses.length === 0) {
        return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
      }
      setClauses.push("updatedAt = datetime('now')")
      args.push(id)

      const affected = await executeLibsql(
        `UPDATE Contact SET ${setClauses.join(', ')} WHERE id = ?`,
        args
      )

      if (affected === 0) {
        return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
      }

      // Devolver el lead actualizado
      const rows = await queryLibsql(
        'SELECT id, name, primaryEmail, primaryPhone, address, message, status, sourceReferrer, sourceIp, ownerId, createdAt, updatedAt FROM Contact WHERE id = ?',
        [id]
      )
      if (rows.length === 0) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
      const lead = rows[0] as any
      lead.createdAt = lead.createdAt ? new Date(lead.createdAt as string).toISOString() : null
      lead.updatedAt = lead.updatedAt ? new Date(lead.updatedAt as string).toISOString() : null
      return NextResponse.json(lead)
    }
  } catch (error) {
    console.error('Error en PATCH /api/admin/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/leads/[id] — eliminar un lead
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // === INTENTO 1: Prisma ===
    try {
      await db.contact.delete({ where: { id } })
      return NextResponse.json({ success: true, id })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/leads/[id] DELETE] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const affected = await executeLibsql('DELETE FROM Contact WHERE id = ?', [id])
      if (affected === 0) {
        return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
      }
      return NextResponse.json({ success: true, id })
    }
  } catch (error) {
    console.error('Error en DELETE /api/admin/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
