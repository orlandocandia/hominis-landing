import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql, executeLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/clientes — listar clientes (con filtros: estado, provincia, vendedorId)
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''
    const vendedorId = searchParams.get('vendedorId') || ''
    const search = searchParams.get('search') || ''

    // === INTENTO 1: Prisma ===
    try {
      const where: any = {}
      if (estado) where.status = estado
      if (vendedorId) where.ownerId = vendedorId
      if (search) where.OR = [
        { name: { contains: search } },
        { primaryEmail: { contains: search } },
      ]

      const [clientes, total] = await Promise.all([
        db.contact.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, name: true, primaryEmail: true, primaryPhone: true,
            status: true, province: true, city: true, address: true,
            latitude: true, longitude: true, photoUrl: true, dni: true, notas: true,
            ownerId: true, empresaId: true, sourceReferrer: true, createdAt: true,
          },
        }),
        db.contact.count({ where }),
      ])
      return NextResponse.json({ clientes, total })
    } catch (prismaErr) {
      console.warn('[admin/clientes GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const conditions: string[] = []
      const args: any[] = []
      if (estado) { conditions.push('status = ?'); args.push(estado) }
      if (vendedorId) { conditions.push('ownerId = ?'); args.push(vendedorId) }
      if (search) {
        conditions.push('(name LIKE ? OR primaryEmail LIKE ?)')
        args.push(`%${search}%`, `%${search}%`)
      }
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

      const clientes = await queryLibsql(
        `SELECT id, name, primaryEmail, primaryPhone, status, province, city, address,
                latitude, longitude, photoUrl, dni, notas, ownerId, empresaId, sourceReferrer, createdAt
         FROM Contact ${whereClause} ORDER BY createdAt DESC LIMIT 100`,
        args
      )
      const total = await scalarLibsql(`SELECT COUNT(*) FROM Contact ${whereClause}`, args)
      return NextResponse.json({ clientes, total })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/clientes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/clientes — crear cliente manualmente
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    if (!body.name) return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 })

    // Buscar un admin para asignar como ownerId si no viene vendedorId
    let ownerId = body.ownerId || body.vendedorId || null

    // === INTENTO 1: Prisma ===
    try {
      const cliente = await db.contact.create({
        data: {
          name: body.name,
          primaryEmail: body.email || null,
          primaryPhone: body.telefono || null,
          address: body.address || body.direccion || '',
          city: body.ciudad || null,
          province: body.provincia || null,
          dni: body.dni || null,
          notas: body.notas || null,
          latitude: body.latitude ? Number(body.latitude) : null,
          longitude: body.longitude ? Number(body.longitude) : null,
          photoUrl: body.photoUrl || null,
          ownerId: ownerId || '',
          empresaId: body.empresaId || null,
          status: body.status || 'NUEVO',
        },
      })
      return NextResponse.json(cliente, { status: 201 })
    } catch (prismaErr) {
      console.warn('[admin/clientes POST] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Si no hay ownerId, buscar un admin
      if (!ownerId) {
        const admins = await queryLibsql("SELECT id FROM User WHERE rol = 'ADMIN' LIMIT 1")
        ownerId = (admins[0] as any)?.id || ''
      }

      const clienteId = 'cliente_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      await executeLibsql(
        `INSERT INTO Contact (id, name, primaryEmail, primaryPhone, address, city, province, dni, notas,
            latitude, longitude, photoUrl, ownerId, empresaId, status, geocodingStatus, assignedAt,
            createdAt, updatedAt, leadScore, leadPriority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'), datetime('now'), 0, 'MEDIA')`,
        [clienteId, body.name, body.email || null, body.telefono || null,
         body.address || body.direccion || '', body.ciudad || null, body.provincia || null,
         body.dni || null, body.notas || null,
         body.latitude ? Number(body.latitude) : null, body.longitude ? Number(body.longitude) : null,
         body.photoUrl || null, ownerId, body.empresaId || null, body.status || 'NUEVO']
      )
      return NextResponse.json({ id: clienteId, ...body, ownerId }, { status: 201 })
    }
  } catch (error) {
    console.error('Error en POST /api/admin/clientes:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
