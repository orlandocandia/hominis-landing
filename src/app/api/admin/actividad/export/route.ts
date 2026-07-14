// GET /api/admin/actividad/export — exportar historial a CSV con filtros.
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

function csvEscape(value: string | null | undefined): string {
  if (value == null) return '';
  // Escapar comillas dobles envolviendo el valor en comillas y duplicando las internas
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const vendedorId = searchParams.get('vendedorId');
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (empresaId) { conditions.push('u.empresaId = ?'); args.push(empresaId); }
    if (action) { conditions.push('ca.action = ?'); args.push(action); }
    if (vendedorId) { conditions.push('ca.userId = ?'); args.push(vendedorId); }
    if (search) {
      conditions.push('(u.nombre LIKE ? OR c.name LIKE ? OR ca.note LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat);
    }
    if (fechaDesde) { conditions.push('ca.createdAt >= ?'); args.push(fechaDesde); }
    if (fechaHasta) { conditions.push('ca.createdAt <= ?'); args.push(fechaHasta + ' 23:59:59'); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await libsql.execute({
      sql: `SELECT ca.createdAt, ca.action, ca.note,
          u.nombre AS vendedor, u.apellido AS vendedorApellido,
          c.name AS lead
        FROM ContactActivity ca
        LEFT JOIN "User" u ON ca.userId = u.id
        LEFT JOIN "Contact" c ON ca.contactId = c.id
        ${where}
        ORDER BY ca.createdAt DESC
        LIMIT 5000`,
      args,
    });

    const headers = ['Fecha', 'Vendedor', 'Acción', 'Lead', 'Nota'];
    const rows = result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      const vendedor = [row.vendedor, row.vendedorApellido].filter(Boolean).join(' ') || 'Sistema';
      return [
        csvEscape(new Date(row.createdAt as string).toLocaleString('es-AR')),
        csvEscape(vendedor),
        csvEscape(row.action as string),
        csvEscape(row.lead as string),
        csvEscape(row.note as string),
      ].join(',');
    });

    const csv = [headers.map(csvEscape).join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=actividad_${dateStr}.csv`,
      },
    });
  } catch (e: unknown) {
    console.error('[admin/actividad/export GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
