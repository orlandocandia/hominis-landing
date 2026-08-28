import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads/export/excel?estado=&origen=
// Exportar todos los leads (con filtros) a Excel (.xls).
// Usamos el formato HTML que Excel abre nativamente (no requiere librerias externas).
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
      leads = leads.map((l) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString('es-AR') : '',
      }))
    } catch (prismaErr) {
      console.warn('[export/excel] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
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
        createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString('es-AR') : '',
      }))
    }

    // Escapar HTML en valores
    const escapeHtml = (s: any): string => {
      if (s === null || s === undefined) return ''
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    // Construir tabla HTML que Excel abre nativamente como .xls
    const rows = leads.map((l) =>
      `    <tr>
      <td>${escapeHtml(l.id)}</td>
      <td>${escapeHtml(l.name)}</td>
      <td>${escapeHtml(l.primaryEmail)}</td>
      <td>${escapeHtml(l.primaryPhone)}</td>
      <td>${escapeHtml(l.message)}</td>
      <td>${escapeHtml(l.status)}</td>
      <td>${escapeHtml(l.sourceReferrer)}</td>
      <td>${escapeHtml(l.sourceIp)}</td>
      <td>${escapeHtml(l.createdAt)}</td>
    </tr>`
    ).join('\n')

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Leads</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
  <table border="1">
    <thead>
      <tr style="background-color:#1d4ed8;color:#ffffff;font-weight:bold">
        <th>ID</th>
        <th>Nombre</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th>Mensaje</th>
        <th>Estado</th>
        <th>Origen</th>
        <th>IP</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_${new Date().toISOString().slice(0, 10)}.xls"`,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/leads/export/excel:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
