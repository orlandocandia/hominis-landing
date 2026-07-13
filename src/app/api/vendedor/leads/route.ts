// GET /api/vendedor/leads — lista paginada de leads (contacts) del vendedor autenticado.
// Multiempresa: filtra por session.user.id Y session.user.empresaId.
// Query params: ?status=NUEVO&page=1&limit=10&search=texto
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'VENDEDOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    const libsql = getTursoClient();
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    const conditions: string[] = ['ownerId = ?'];
    const args: (string | number)[] = [userId];

    if (empresaId) {
      conditions.push('empresaId = ?');
      args.push(empresaId);
    }
    if (status && status !== 'TODOS') {
      conditions.push('status = ?');
      args.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR primaryEmail LIKE ? OR primaryPhone LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    // Count
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS n FROM "Contact" ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.n ?? 0);

    // Leads paginados
    const leadsRes = await libsql.execute({
      sql: `SELECT id, name, primaryEmail, primaryPhone, address, city, status,
        leadScore, leadPriority, createdAt
        FROM "Contact" ${where}
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      leads: leadsRes.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[vendedor/leads GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
