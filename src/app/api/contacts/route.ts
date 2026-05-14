// GET /api/contacts - List all contacts with filters
// Protected: requires authentication
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

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

    // Build where clause
    const where: Record<string, unknown> = {};

    if (estado && estado !== 'TODOS') {
      where.estado = estado;
    }

    if (segmento && segmento !== 'TODOS') {
      where.segmento = segmento;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
        { email: { contains: search } },
        { telefono: { contains: search } },
        { mensaje: { contains: search } },
      ];
    }

    const [contacts, total] = await Promise.all([
      db.contacto.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.contacto.count({ where }),
    ]);

    // Get stats
    const stats = await db.contacto.groupBy({
      by: ['estado'],
      _count: { id: true },
    });

    const statsMap: Record<string, number> = { NUEVO: 0, LEIDO: 0, ATENDIDO: 0 };
    stats.forEach((s) => {
      statsMap[s.estado] = s._count.id;
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
