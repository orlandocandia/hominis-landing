// GET /api/contacts - List all contacts with filters
// Protected: requires authentication
// Uses raw SQL via Turso (no Prisma dependency)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

function getTursoClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');
  return createClient({
    url: process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
}

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
    const statsResult = await libsql.execute(
      `SELECT estado, COUNT(*) as count FROM Contacto GROUP BY estado`
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
