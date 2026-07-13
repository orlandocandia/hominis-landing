// GET /api/contacts - List all contacts with filters
// Protected: requires authentication
// Uses raw SQL via Turso (no Prisma dependency)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const segmento = searchParams.get('segmento');
    const search = searchParams.get('search');

    // Multiempresa: VENDEDOR solo ve su empresa; ADMIN puede filtrar por ?empresaId=
    const empresaFiltro =
      session.user.role === 'ADMIN'
        ? searchParams.get('empresaId') || null
        : session.user.empresaId || null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const libsql = getTursoClient();

    // Build WHERE clause
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (estado && estado !== 'TODOS') {
      conditions.push('estado = ?');
      args.push(estado);
    }

    if (segmento && segmento !== 'TODOS') {
      conditions.push('segmento = ?');
      args.push(segmento);
    }

    if (search) {
      conditions.push('(nombre LIKE ? OR email LIKE ? OR telefono LIKE ? OR mensaje LIKE ?)');
      const searchPattern = `%${search}%`;
      args.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (empresaFiltro) {
      conditions.push('empresaId = ?');
      args.push(empresaFiltro);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count total
    const countResult = await libsql.execute({
      sql: `SELECT COUNT(*) as total FROM Contacto ${whereClause}`,
      args,
    });
    const total = Number(countResult.rows[0]?.total || 0);

    // Get contacts
    const contactsResult = await libsql.execute({
      sql: `SELECT * FROM Contacto ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, skip],
    });

    const contacts = contactsResult.rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono,
      segmento: row.segmento,
      mensaje: row.mensaje,
      cobertura: row.cobertura,
      edad: row.edad,
      origen: row.origen,
      ip: row.ip,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    // Get stats
    const statsSql = empresaFiltro
      ? `SELECT estado, COUNT(*) as count FROM Contacto WHERE empresaId = ? GROUP BY estado`
      : `SELECT estado, COUNT(*) as count FROM Contacto GROUP BY estado`;
    const statsResult = await libsql.execute(
      empresaFiltro ? { sql: statsSql, args: [empresaFiltro] } : { sql: statsSql }
    );
    const statsMap: Record<string, number> = { NUEVO: 0, LEIDO: 0, ATENDIDO: 0 };
    statsResult.rows.forEach((row) => {
      const est = row.estado as string;
      if (est in statsMap) {
        statsMap[est] = Number(row.count);
      }
    });

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: statsMap,
    });
  } catch (error) {
    console.error('[Contacts API] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener contactos' },
      { status: 500 }
    );
  }
}

