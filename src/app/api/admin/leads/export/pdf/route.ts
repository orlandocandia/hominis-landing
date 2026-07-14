// GET /api/admin/leads/export/pdf — exportar leads a PDF
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import PDFDocument from 'pdfkit';

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

    // Crear PDF con Promise (para esperar el buffer completo)
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Título
      doc.fontSize(20).text('Reporte de Leads', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-AR')}`);
      doc.fontSize(10).text(`Total: ${result.rows.length} leads`);
      doc.moveDown();

      // Tabla
      const colX = [50, 120, 270, 370, 470];
      const colW = [70, 150, 100, 100, 80];
      const headers = ['#', 'Nombre', 'Email', 'Teléfono', 'Estado'];

      // Header row
      doc.font('Helvetica-Bold').fontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, colX[i], doc.y, { width: colW[i] });
      });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(8);

      // Data rows
      result.rows.forEach((row, index) => {
        const r = row as Record<string, unknown>;
        if (doc.y > 720) {
          doc.addPage();
        }

        const y = doc.y;
        doc.text(String(index + 1), colX[0], y, { width: colW[0] });
        doc.text(String(r.nombre || ''), colX[1], y, { width: colW[1] });
        doc.text(String(r.email || ''), colX[2], y, { width: colW[2] });
        doc.text(String(r.telefono || ''), colX[3], y, { width: colW[3] });
        doc.text(String(r.estado || 'NUEVO'), colX[4], y, { width: colW[4] });
        doc.moveDown(0.3);
      });

      doc.end();
    });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=leads_${new Date().toISOString().split('T')[0]}.pdf`,
      },
    });
  } catch (e: unknown) {
    console.error('[leads/export/pdf] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
