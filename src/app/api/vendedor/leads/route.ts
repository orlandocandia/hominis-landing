// GET /api/vendedor/leads — lista paginada de leads (Contact) del vendedor
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = ['c.ownerId = ?'];
    const args: (string | number)[] = [userId];

    if (empresaId) { conditions.push('c.empresaId = ?'); args.push(empresaId); }
    if (status && status !== 'TODOS') { conditions.push('c.status = ?'); args.push(status); }
    if (search) {
      conditions.push('(c.name LIKE ? OR c.primaryEmail LIKE ? OR c.primaryPhone LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    const countRes = await libsql.execute({ sql: `SELECT COUNT(*) AS total FROM Contact c ${where}`, args });
    const total = Number(countRes.rows[0]?.total ?? 0);

    const result = await libsql.execute({
      sql: `SELECT c.id, c.name, c.primaryEmail, c.primaryPhone, c.message, c.status,
          c.leadScore, c.leadPriority, c.createdAt, c.address, c.city
        FROM Contact c ${where}
        ORDER BY c.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      leads: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[vendedor/leads GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
