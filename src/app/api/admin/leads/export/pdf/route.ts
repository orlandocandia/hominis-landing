// GET /api/admin/leads/export/pdf — exportar leads a PDF (via HTML print, sin pdfkit)
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (empresaId) { conditions.push('empresaId = ?'); args.push(empresaId); }
    if (status) { conditions.push('estado = ?'); args.push(status); }
    if (search) {
      conditions.push('(nombre LIKE ? OR email LIKE ? OR telefono LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await libsql.execute({
      sql: `SELECT nombre, email, telefono, mensaje, estado, segmento, createdAt
        FROM Contacto ${where} ORDER BY createdAt DESC LIMIT 50`,
      args,
    });

    // Generate printable HTML (browser will handle PDF via print dialog)
    const rows = result.rows.map((row, i) => {
      const r = row as Record<string, unknown>;
      return `<tr>
        <td>${i + 1}</td>
        <td>${r.nombre || ''}</td>
        <td>${r.email || ''}</td>
        <td>${r.telefono || ''}</td>
        <td>${r.estado || 'NUEVO'}</td>
        <td>${r.createdAt ? new Date(r.createdAt as string).toLocaleDateString('es-AR') : ''}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reporte de Leads - ${new Date().toLocaleDateString('es-AR')}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; }
  h1 { text-align: center; color: #2E86AB; }
  .info { margin-bottom: 20px; color: #666; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #2E86AB; color: white; padding: 10px; text-align: left; font-size: 12px; }
  td { padding: 8px 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
  tr:nth-child(even) { background: #f9f9f9; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <h1>Reporte de Leads</h1>
  <div class="info">
    <p>Generado: ${new Date().toLocaleString('es-AR')}</p>
    <p>Total: ${result.rows.length} leads</p>
  </div>
  <table>
    <thead>
      <tr><th>#</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th><th>Fecha</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e: unknown) {
    console.error('[leads/export/pdf] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
