import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/leads/[id]/print — vista de impresión HTML de un solo lead
// Devuelve HTML optimizado para impresión/PDF (sin sidebar, sin header).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // Obtener el lead (Prisma o fallback libsql)
    let lead: any = null
    try {
      lead = await db.contact.findUnique({ where: { id } })
      if (lead) {
        lead.createdAt = lead.createdAt ? new Date(lead.createdAt).toLocaleString('es-AR') : ''
        lead.updatedAt = lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('es-AR') : ''
      }
    } catch (prismaErr) {
      console.warn('[admin/leads/[id]/print] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
      const rows = await queryLibsql(
        'SELECT id, name, primaryEmail, primaryPhone, address, message, status, sourceReferrer, sourceIp, createdAt, updatedAt FROM Contact WHERE id = ?',
        [id]
      )
      if (rows.length > 0) {
        lead = rows[0] as any
        lead.createdAt = lead.createdAt ? new Date(lead.createdAt as string).toLocaleString('es-AR') : ''
        lead.updatedAt = lead.updatedAt ? new Date(lead.updatedAt as string).toLocaleString('es-AR') : ''
      }
    }

    if (!lead) {
      return new NextResponse('<html><body><h1>Lead no encontrado</h1></body></html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const escapeHtml = (s: any): string => {
      if (s === null || s === undefined) return ''
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    const origenLabel = lead.sourceReferrer === 'landing-hominis' ? '🏥 Hominis' :
                        lead.sourceReferrer === 'landing-seguros' ? '📋 Cotiza Seguros' : 'Directo'

    const STATUS_LABELS: Record<string, string> = {
      NUEVO: 'Nuevo', LEIDO: 'Leído', EN_CONTACTO: 'En contacto', REUNION: 'Reunión',
      PRESUPUESTO: 'Presupuesto', ATENDIDO: 'Atendido', RECHAZADO: 'Rechazado',
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Lead: ${escapeHtml(lead.name)}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; padding: 40px; max-width: 700px; margin: 0 auto; }
    .header { border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { color: #1d4ed8; margin: 0 0 4px; font-size: 24px; }
    .header .origen { color: #6b7280; font-size: 14px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 16px; color: #1f2937; }
    .field-value.email a { color: #1d4ed8; text-decoration: none; }
    .message-box { background: #f9fafb; border-left: 4px solid #1d4ed8; padding: 12px 16px; border-radius: 4px; font-size: 14px; line-height: 1.5; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; background: #ede9fe; color: #7c3aed; font-size: 13px; font-weight: 600; }
    .print-btn {
      position: fixed; top: 20px; right: 20px;
      background: #1d4ed8; color: white; border: none; padding: 10px 20px;
      border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600;
    }
    .print-btn:hover { background: #1e40af; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir</button>
  <div class="header">
    <h1>${escapeHtml(lead.name)}</h1>
    <div class="origen">${escapeHtml(origenLabel)} — Asesoría de Salud</div>
  </div>

  <div class="field">
    <div class="field-label">Estado</div>
    <div class="field-value"><span class="status-badge">${escapeHtml(STATUS_LABELS[lead.status] || lead.status)}</span></div>
  </div>

  <div class="field">
    <div class="field-label">Email</div>
    <div class="field-value email"><a href="mailto:${escapeHtml(lead.primaryEmail)}">${escapeHtml(lead.primaryEmail)}</a></div>
  </div>

  <div class="field">
    <div class="field-label">Teléfono</div>
    <div class="field-value"><a href="tel:${escapeHtml(lead.primaryPhone)}">${escapeHtml(lead.primaryPhone)}</a></div>
  </div>

  ${lead.message ? `
  <div class="field">
    <div class="field-label">Mensaje</div>
    <div class="message-box">${escapeHtml(lead.message)}</div>
  </div>
  ` : ''}

  <div class="field">
    <div class="field-label">Fecha de creación</div>
    <div class="field-value">${escapeHtml(lead.createdAt)}</div>
  </div>

  ${lead.sourceIp ? `
  <div class="field">
    <div class="field-label">IP de origen</div>
    <div class="field-value">${escapeHtml(lead.sourceIp)}</div>
  </div>
  ` : ''}
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('Error en GET /api/admin/leads/[id]/print:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
