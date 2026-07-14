// GET /api/admin/stats — estadísticas generales del admin (filtradas por empresa)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 });
    }

    const libsql = getTursoClient();
    const empresaId = session.user.empresaId || null;

    // Construir filtro de empresa para Contacto (tabla legacy de leads)
    const emp = empresaId ? 'AND empresaId = ?' : '';
    const empArgs = empresaId ? [empresaId] : [];

    const [totalRes, nuevosRes, atendidosRes] = await Promise.all([
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Contacto WHERE 1=1 ${emp}`,
        args: empArgs,
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Contacto WHERE estado = 'NUEVO' ${emp}`,
        args: empArgs,
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Contacto WHERE estado = 'ATENDIDO' ${emp}`,
        args: empArgs,
      }),
    ]);

    const num = (r: { rows: Array<Record<string, unknown>> }) => Number(r.rows[0]?.n ?? 0);
    const totalLeads = num(totalRes);
    const nuevos = num(nuevosRes);
    const atendidos = num(atendidosRes);

    return NextResponse.json({ totalLeads, nuevos, atendidos });
  } catch (e: unknown) {
    console.error('[admin/stats GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
