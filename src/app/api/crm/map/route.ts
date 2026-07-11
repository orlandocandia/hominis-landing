// GET /api/crm/map — returns geolocated contacts + vendors for map rendering
// Role-filtered:
//   VENDEDOR → only their own contacts (no vendors)
//   PRODUCTOR → all team contacts + all vendors
//   ADMIN → everything
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const libsql = getTursoClient();
    const role = session.user.role;

    // ─── Contacts ───
    let contactsSql = `SELECT c.id, c.name, c.address, c.city, c.latitude, c.longitude, c.status, c.segment,
      u.nombre as ownerNombre, u.apellido as ownerApellido
      FROM Contact c LEFT JOIN "User" u ON c.ownerId = u.id
      WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL`;
    const contactsArgs: string[] = [];
    if (role === 'VENDEDOR') {
      contactsSql += ' AND c.ownerId = ?';
      contactsArgs.push(session.user.id);
    }
    contactsSql += ' ORDER BY c.createdAt DESC LIMIT 500';
    const contactsRes = await libsql.execute({ sql: contactsSql, args: contactsArgs });

    // ─── Vendors (only PRODUCTOR/ADMIN can see team) ───
    let vendors: any[] = [];
    if (role === 'PRODUCTOR' || role === 'ADMIN') {
      const vendorsRes = await libsql.execute({
        sql: `SELECT id, nombre, apellido, email, rol, city, province, latitude, longitude,
          serviceRadius, totalContacts, conversionRate, avatarUrl
          FROM "User"
          WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1
            AND latitude IS NOT NULL AND longitude IS NOT NULL`,
      });
      vendors = vendorsRes.rows;
    }

    return NextResponse.json({
      contacts: contactsRes.rows,
      vendors,
      counts: { contacts: contactsRes.rows.length, vendors: vendors.length },
    });
  } catch (e: any) {
    console.error('[crm/map GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
