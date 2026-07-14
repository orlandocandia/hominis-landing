// GET /api/admin/leads/export/excel — exportar leads a Excel
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import ExcelJS from 'exceljs';

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
        FROM Contacto ${where} ORDER BY createdAt DESC LIMIT 5000`,
      args,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hominis CRM';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Leads');

    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Mensaje', key: 'mensaje', width: 40 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Segmento', key: 'segmento', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
    ];

    // Header style
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E86AB' },
    };

    result.rows.forEach((row) => {
      const r = row as Record<string, unknown>;
      worksheet.addRow({
        nombre: r.nombre || '',
        email: r.email || '',
        telefono: r.telefono || '',
        mensaje: r.mensaje || '',
        estado: r.estado || 'NUEVO',
        segmento: r.segmento || '',
        fecha: r.createdAt ? new Date(r.createdAt as string).toLocaleString('es-AR') : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=leads_${new Date().toISOString().split('T')[0]}.xlsx`,
      },
    });
  } catch (e: unknown) {
    console.error('[leads/export/excel] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
