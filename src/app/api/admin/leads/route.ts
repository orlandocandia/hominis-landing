// GET /api/admin/leads — lista paginada de leads (tabla Contacto) con filtros.
// Multiempresa: filtra por session.user.empresaId.
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
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const segmento = searchParams.get('segmento');
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const libsql = getTursoClient();

    const conditions: string[] = [];
    const args: (string | number)[] = [];

    // Multiempresa: filtrar por empresa de la sesión
    const empresaId = session.user.empresaId || null;
    if (empresaId) {
      conditions.push('empresaId = ?');
      args.push(empresaId);
    }

    if (status) {
      conditions.push('estado = ?');
      args.push(status);
    }
    if (segmento) {
      conditions.push('segmento = ?');
      args.push(segmento);
    }
    if (search) {
      conditions.push('(nombre LIKE ? OR email LIKE ? OR telefono LIKE ? OR mensaje LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat, pat);
    }
    if (fechaDesde) {
      conditions.push('createdAt >= ?');
      args.push(fechaDesde);
    }
    if (fechaHasta) {
      conditions.push('createdAt <= ?');
      args.push(fechaHasta + ' 23:59:59');
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count total
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS total FROM Contacto ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    // Get leads (alias columns to match frontend: nombre→name, estado→status)
    const leadsRes = await libsql.execute({
      sql: `SELECT id, nombre AS name, email, telefono, mensaje, segmento, cobertura, edad,
        estado AS status, createdAt, updatedAt, empresaId
        FROM Contacto ${where}
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      leads: leadsRes.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[admin/leads GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
