// GET /api/admin/stats/equipo
// Estadísticas del equipo de ventas para el Panel de Control (Fase 3).
// Devuelve totales + listado de vendedores con métricas por vendedor.
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
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const libsql = getTursoClient();

    // --- Totales ---
    const [vRes, lRes, tRes] = await Promise.all([
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "User" WHERE rol = 'VENDEDOR' AND activo = 1`,
      }),
      libsql.execute({ sql: `SELECT COUNT(*) AS n FROM "Contact"` }),
      libsql.execute({
        sql: `SELECT COUNT(*) AS n FROM "Tarea" WHERE estado IN ('PENDIENTE','EN_PROGRESO')`,
      }),
    ]);

    const totalVendedores = Number((vRes.rows[0] as Record<string, unknown>).n ?? 0);
    const totalLeads = Number((lRes.rows[0] as Record<string, unknown>).n ?? 0);
    const totalTareas = Number((tRes.rows[0] as Record<string, unknown>).n ?? 0);

    // --- Vendedores con métricas ---
    const vendedoresRes = await libsql.execute({
      sql: `
        SELECT
          u.id,
          u.email,
          u.nombre,
          u.apellido,
          u.activo,
          u."avatarUrl",
          u."coverageAreas",
          u."fechaAlta",
          (SELECT COUNT(*) FROM "Contact" c WHERE c."ownerId" = u.id) AS leads,
          (SELECT COUNT(*) FROM "Contact" c
            WHERE c."ownerId" = u.id
              AND c.status IN ('REUNION','PRESUPUESTO','ATENDIDO')) AS atendidos,
          (SELECT COUNT(*) FROM "Tarea" t
            WHERE t."asignadoA" = u.id
              AND t.estado IN ('PENDIENTE','EN_PROGRESO')) AS "tareasPendientes"
        FROM "User" u
        WHERE u.rol = 'VENDEDOR'
        ORDER BY u."fechaAlta" ASC
      `,
    });

    const vendedores = vendedoresRes.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        nombre: row.nombre ? String(row.nombre) : '',
        apellido: row.apellido ? String(row.apellido) : '',
        activo: Boolean(row.activo),
        avatarUrl: row.avatarUrl ? String(row.avatarUrl) : null,
        coverageAreas: row.coverageAreas ? String(row.coverageAreas) : null,
        fechaAlta: row.fechaAlta ? String(row.fechaAlta) : null,
        _count: {
          contacts: Number(row.leads ?? 0),
          contactsAtendidos: Number(row.atendidos ?? 0),
          tareasPendientes: Number(row.tareasPendientes ?? 0),
        },
      };
    });

    return NextResponse.json({
      totalVendedores,
      totalLeads,
      totalTareas,
      vendedores,
    });
  } catch (e: unknown) {
    console.error('[stats/equipo GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

