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

    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;
    const libsql = getTursoClient();

    // Contact (CRM) has ownerId; Contacto (legacy) does not
    const emp = empresaId ? 'AND empresaId = ?' : '';
    const empArgs = empresaId ? [empresaId] : [];

    const [tareasPend, tareasComp, leadsTotal, leadsAtend] = await Promise.all([
      libsql.execute({ sql: `SELECT COUNT(*) AS n FROM Tarea WHERE asignadoA = ? ${emp} AND estado IN ('PENDIENTE','EN_PROGRESO')`, args: [userId, ...empArgs] }),
      libsql.execute({ sql: `SELECT COUNT(*) AS n FROM Tarea WHERE asignadoA = ? ${emp} AND estado = 'COMPLETADA'`, args: [userId, ...empArgs] }),
      libsql.execute({ sql: `SELECT COUNT(*) AS n FROM Contact WHERE ownerId = ? ${emp}`, args: [userId, ...empArgs] }),
      libsql.execute({ sql: `SELECT COUNT(*) AS n FROM Contact WHERE ownerId = ? ${emp} AND status = 'ATENDIDO'`, args: [userId, ...empArgs] }),
    ]);

    const num = (r: { rows: Array<Record<string, unknown>> }) => Number(r.rows[0]?.n ?? 0);
    return NextResponse.json({
      tareasPendientes: num(tareasPend),
      tareasCompletadas: num(tareasComp),
      leadsAsignados: num(leadsTotal),
      leadsAtendidos: num(leadsAtend),
    });
  } catch (e: unknown) {
    console.error('[vendedor/stats GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
