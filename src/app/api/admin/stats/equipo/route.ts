// GET /api/admin/stats/equipo — estadísticas del equipo de ventas
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

    const [vRes, lRes, tRes] = await Promise.all([
      libsql.execute({
        sql: empresaId
          ? `SELECT COUNT(*) AS n FROM "User" WHERE rol = 'VENDEDOR' AND activo = 1 AND empresaId = ?`
          : `SELECT COUNT(*) AS n FROM "User" WHERE rol = 'VENDEDOR' AND activo = 1`,
        args: empresaId ? [empresaId] : [],
      }),
      libsql.execute({
        sql: empresaId
          ? `SELECT COUNT(*) AS n FROM Contacto WHERE empresaId = ?`
          : `SELECT COUNT(*) AS n FROM Contacto`,
        args: empresaId ? [empresaId] : [],
      }),
      libsql.execute({
        sql: empresaId
          ? `SELECT COUNT(*) AS n FROM Tarea WHERE estado IN ('PENDIENTE','EN_PROGRESO') AND empresaId = ?`
          : `SELECT COUNT(*) AS n FROM Tarea WHERE estado IN ('PENDIENTE','EN_PROGRESO')`,
        args: empresaId ? [empresaId] : [],
      }),
    ]);

    const num = (r: { rows: Array<Record<string, unknown>> }) => Number(r.rows[0]?.n ?? 0);

    return NextResponse.json({
      totalVendedores: num(vRes),
      totalLeads: num(lRes),
      totalTareas: num(tRes),
    });
  } catch (e: unknown) {
    console.error('[admin/stats/equipo GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
