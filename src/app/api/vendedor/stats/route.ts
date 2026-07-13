// GET /api/vendedor/stats — estadísticas del vendedor autenticado.
// Multiempresa: filtra por session.user.id Y session.user.empresaId.
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'VENDEDOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const libsql = getTursoClient();
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    // Construir cláusula empresa para todas las queries
    const emp = empresaId ? 'AND empresaId = ?' : '';
    const empArgs = empresaId ? [empresaId] : [];

    const [tareasPend, tareasComp, leadsTotal, leadsNuevos, leadsAtendidos] = await Promise.all([
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Tarea" WHERE asignadoA = ? ${emp} AND estado IN ('PENDIENTE','EN_PROGRESO')`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Tarea" WHERE asignadoA = ? ${emp} AND estado = 'COMPLETADA'`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Contact" WHERE ownerId = ? ${emp}`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Contact" WHERE ownerId = ? ${emp} AND status = 'NUEVO'`,
        args: [userId, ...empArgs],
      }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Contact" WHERE ownerId = ? ${emp} AND status = 'ATENDIDO'`,
        args: [userId, ...empArgs],
      }),
    ]);

    const num = (r: { rows: Array<Record<string, unknown>> }) =>
      Number(r.rows[0]?.n ?? 0);

    return NextResponse.json({
      tareasPendientes: num(tareasPend),
      tareasCompletadas: num(tareasComp),
      leadsTotal: num(leadsTotal),
      leadsNuevos: num(leadsNuevos),
      leadsAtendidos: num(leadsAtendidos),
      conversion:
        num(leadsTotal) > 0
          ? Number(((num(leadsAtendidos) / num(leadsTotal)) * 100).toFixed(2))
          : 0,
    });
  } catch (e: unknown) {
    console.error('[vendedor/stats GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
