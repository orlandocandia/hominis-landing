// GET /api/vendedor/stats — estadísticas del vendedor autenticado
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const libsql = getTursoClient();
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    // Filtro de empresa para Contact y Tarea
    const empContact = empresaId ? 'AND empresaId = ?' : '';
    const empTarea = empresaId ? 'AND empresaId = ?' : '';
    const empArgs = empresaId ? [empresaId] : [];

    const [tareasPendRes, tareasCompRes, leadsTotalRes, leadsAtendRes] = await Promise.all([
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Tarea WHERE asignadoA = ? AND estado IN ('PENDIENTE','EN_PROGRESO') ${empTarea}`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Tarea WHERE asignadoA = ? AND estado = 'COMPLETADA' ${empTarea}`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Contact WHERE ownerId = ? ${empContact}`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM Contact WHERE ownerId = ? AND status = 'ATENDIDO' ${empContact}`,
        args: [userId, ...empArgs],
      }),
    ]);

    const num = (r: { rows: Array<Record<string, unknown>> }) => Number(r.rows[0]?.n ?? 0);

    return NextResponse.json({
      tareasPendientes: num(tareasPendRes),
      tareasCompletadas: num(tareasCompRes),
      leadsAsignados: num(leadsTotalRes),
      leadsAtendidos: num(leadsAtendRes),
    });
  } catch (e: unknown) {
    console.error('[vendedor/stats GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
