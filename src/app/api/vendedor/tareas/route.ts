// GET /api/vendedor/tareas — lista paginada de tareas del vendedor autenticado.
// Multiempresa: filtra por session.user.id Y session.user.empresaId.
// Query params: ?estado=PENDIENTE&page=1&limit=10
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

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
    const estado = searchParams.get('estado');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    const libsql = getTursoClient();
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    const conditions: string[] = ['t.asignadoA = ?'];
    const args: (string | number)[] = [userId];

    if (empresaId) {
      conditions.push('t.empresaId = ?');
      args.push(empresaId);
    }
    if (estado && VALID_ESTADOS.includes(estado)) {
      conditions.push('t.estado = ?');
      args.push(estado);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    // Count total
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS n FROM "Tarea" t ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.n ?? 0);

    // Get tareas (paginado)
    const tareasRes = await libsql.execute({
      sql: `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.fechaLimite, t.fechaCompletada,
        t.contactoId, c.name AS contactoNombre, c.primaryPhone AS contactoPhone
        FROM "Tarea" t
        LEFT JOIN "Contact" c ON t.contactoId = c.id
        ${where}
        ORDER BY t.fechaLimite ASC, t.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      tareas: tareasRes.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[vendedor/tareas GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
