import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads?page=1&limit=20&origen=&estado=
// Lista de leads (tabla Contact) con paginación y filtros.
// FLUJO: intenta Prisma primero; si falla (URL_INVALID en Vercel), usa fallback libsql.
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const estado = searchParams.get('estado') || ''
    const origen = searchParams.get('origen') || ''

    // === INTENTO 1: Prisma ===
    try {
      const where: any = {}
      if (estado) where.status = estado
      if (origen) where.sourceReferrer = origen

      const [leads, total] = await Promise.all([
        db.contact.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true, name: true, primaryEmail: true, primaryPhone: true,
            message: true, status: true, sourceReferrer: true, sourceIp: true,
            createdAt: true,
          },
        }),
        db.contact.count({ where }),
      ])

      return NextResponse.json({ leads, total, page, limit, totalPages: Math.ceil(total / limit) })
    } catch (prismaErr) {
      // Prisma fallo (probablemente URL_INVALID por process.env.DATABASE_URL='undefined' en Vercel).
      // Fallback: usar @libsql/client directo con SQL crudo.
      console.warn('[admin/leads] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      // Construir WHERE clause para SQL crudo
      const conditions: string[] = []
      const args: any[] = []
      if (estado) {
        conditions.push('status = ?')
        args.push(estado)
      }
      if (origen) {
        conditions.push('sourceReferrer = ?')
        args.push(origen)
      }
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

      // Consulta de datos
      const offset = (page - 1) * limit
      const leadsSql = `SELECT id, name, primaryEmail, primaryPhone, message, status, sourceReferrer, sourceIp, createdAt
                        FROM Contact ${whereClause}
                        ORDER BY createdAt DESC
                        LIMIT ? OFFSET ?`
      const leads = await queryLibsql(leadsSql, [...args, limit, offset])

      // Consulta de count
      const countSql = `SELECT COUNT(*) as n FROM Contact ${whereClause}`
      const total = await scalarLibsql(countSql, args)

      // Convertir fechas a ISO string para consistencia con Prisma
      const leadsFormatted = leads.map((l: any) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      }))

      return NextResponse.json({
        leads: leadsFormatted,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    }
  } catch (error) {
    console.error('Error en GET /api/admin/leads:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
