import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads/export/pdf?estado=&origen=
// Exportar todos los leads (con filtros) a un PDF imprimible.
// Como no tenemos una libreria de PDF en el backend, generamos un HTML
// optimizado para impresion que el navegador puede guardar como PDF
// (Ctrl+P → "Guardar como PDF").
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
          message: true, status: true, sourceReferrer: true, createdAt: true,
        },
      })
      leads = leads.map((l) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString('es-AR') : '',
      }))
    } catch (prismaErr) {
      console.warn('[export/pdf] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const conditions: string[] = []
      const args: any[] = []
      if (estado) { conditions.push('status = ?'); args.push(estado) }
      if (origen) { conditions.push('sourceReferrer = ?'); args.push(origen) }
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      leads = await queryLibsql(
        `SELECT id, name, primaryEmail, primaryPhone, message, status, sourceReferrer, createdAt FROM Contact ${whereClause} ORDER BY createdAt DESC`,
        args
      )
      leads = leads.map((l: any) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toLocaleString('es-AR') : '',
      }))
    }

    const escapeHtml = (s: any): string => {
      if (s === null || s === undefined) return ''
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    const STATUS_COLORS: Record<string, string> = {
      NUEVO: '#7c3aed', LEIDO: '#0284c7', EN_CONTACTO: '#d97706',
      ATENDIDO: '#059669', RECHAZADO: '#dc2626', REUNION: '#6366f1', PRESUPUESTO: '#0d9488',
    }

    const rows = leads.map((l) => {
      const color = STATUS_COLORS[l.status] || '#6b7280'
      const origenLabel = l.sourceReferrer === 'landing-hominis' ? 'Hominis' :
                          l.sourceReferrer === 'landing-seguros' ? 'Cotiza' : 'Directo'
      return `      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(l.name)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(l.primaryEmail)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(l.primaryPhone)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;max-width:250px;">${escapeHtml(l.message)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;"><span style="color:${color};font-weight:600;">${escapeHtml(l.status)}</span></td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(origenLabel)}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(l.createdAt)}</td>
      </tr>`
    }).join('\n')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Leads — ${new Date().toLocaleDateString('es-AR')}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; padding: 20px; }
    h1 { color: #1d4ed8; margin: 0 0 4px; font-size: 22px; }
    .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead { background: #1d4ed8; color: white; }
    th { padding: 10px 8px; text-align: left; border: 1px solid #1d4ed8; font-weight: 600; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    .print-btn {
      position: fixed; top: 20px; right: 20px;
      background: #1d4ed8; color: white; border: none; padding: 10px 20px;
      border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;
    }
    .print-btn:hover { background: #1e40af; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  <h1>Listado de Leads</h1>
  <div class="subtitle">Generado el ${new Date().toLocaleString('es-AR')} — ${leads.length} leads ${estado || origen ? `(filtros: ${estado ? `estado=${estado}` : ''}${estado && origen ? ', ' : ''}${origen ? `origen=${origen}` : ''})` : ''}</div>
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th>Mensaje</th>
        <th>Estado</th>
        <th>Origen</th>
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
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="leads_${new Date().toISOString().slice(0, 10)}.html"`,
      },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/leads/export/pdf:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
