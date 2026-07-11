// GET /api/admin/stats — dashboard metrics
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const libsql = getTursoClient();
    const queries = await Promise.all([
      libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1`),
      libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol = 'VENDEDOR' AND activo = 1`),
      libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol = 'PRODUCTOR' AND activo = 1`),
      libsql.execute(`SELECT COUNT(*) as n FROM Contact`),
      libsql.execute(`SELECT COUNT(*) as n FROM Contact WHERE status = 'NUEVO'`),
      libsql.execute(`SELECT COUNT(*) as n FROM Contact WHERE status = 'ATENDIDO'`),
      libsql.execute(`SELECT COUNT(*) as n FROM Contacto WHERE estado = 'NUEVO'`),
      libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1 AND latitude IS NOT NULL`),
    ]);

    const num = (i: number) => Number((queries[i].rows[0] as any).n);
    const activeVendors = num(0);
    const totalVendedores = num(1);
    const totalProductores = num(2);
    const totalContacts = num(3);
    const newContacts = num(4);
    const attendedContacts = num(5);
    const newLeads = num(6);
    const geolocatedVendors = num(7);

    // Top vendors by contacts
    const topVendorsRes = await libsql.execute({
      sql: `SELECT u.id, u.nombre, u.apellido, u.email, u.totalContacts, u.conversionRate, u.city
        FROM "User" u WHERE u.rol IN ('VENDEDOR','PRODUCTOR') AND u.activo = 1
        ORDER BY u.totalContacts DESC LIMIT 5`,
    });

    return NextResponse.json({
      activeVendors,
      totalVendedores,
      totalProductores,
      totalContacts,
      newContacts,
      attendedContacts,
      conversionRate: totalContacts > 0 ? Number(((attendedContacts / totalContacts) * 100).toFixed(2)) : 0,
      newLeads,
      geolocatedVendors,
      topVendors: topVendorsRes.rows,
    });
  } catch (e: any) {
    console.error('[stats GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
