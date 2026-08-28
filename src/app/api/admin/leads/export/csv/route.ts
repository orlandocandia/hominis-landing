import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads/export/csv?estado=&origen=
// Exportar todos los leads (con filtros) a CSV.
export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''
    const origen = searchParams.get('origen') || ''

    // Obtener leads (Prisma o fallback libsql)
    let leads: any[] = []
    try {
      const where: any = {}
      if (estado) where.status = estado
      if (origen) where.sourceReferrer = origen
      leads = await db.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, primaryEmail: true, primaryPhone: true,
          message: true, status: true, sourceReferrer: true, sourceIp: true,
          createdAt: true,
        },
      })
      // Convertir fechas a ISO string
      leads = leads.map((l) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : '',
      }))
    } catch (prismaErr) {
      console.warn('[export/csv] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const conditions: string[] = []
      const args: any[] = []
      if (estado) { conditions.push('status = ?'); args.push(estado) }
      if (origen) { conditions.push('sourceReferrer = ?'); args.push(origen) }
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      leads = await queryLibsql(
        `SELECT id, name, primaryEmail, primaryPhone, message, status, sourceReferrer, sourceIp, createdAt FROM Contact ${whereClause} ORDER BY createdAt DESC`,
        args
      )
      leads = leads.map((l: any) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : '',
      }))
    }

    // Construir CSV
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Mensaje', 'Estado', 'Origen', 'IP', 'Fecha']
    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return ''
      const s = String(val)
      // Escapar comillas dobles y envolver en comillas si contiene coma, nueva linea o comilla
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const rows = leads.map((l) =>
      [l.id, l.name, l.primaryEmail, l.primaryPhone, l.message, l.status, l.sourceReferrer, l.sourceIp, l.createdAt]
        .map(escapeCsv).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\r\n')

    // Devolver como archivo CSV
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/leads/export/csv:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
