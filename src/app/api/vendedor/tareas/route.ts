// GET /api/vendedor/tareas — lista paginada de tareas del vendedor
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
    const estado = searchParams.get('estado');
    const prioridad = searchParams.get('prioridad');
    const search = searchParams.get('search');
    const userId = session.user.id;
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = ['t.asignadoA = ?'];
    const args: (string | number)[] = [userId];

    if (empresaId) { conditions.push('t.empresaId = ?'); args.push(empresaId); }
    if (estado) { conditions.push('t.estado = ?'); args.push(estado); }
    if (prioridad) { conditions.push('t.prioridad = ?'); args.push(prioridad); }
    if (search) { conditions.push('t.titulo LIKE ?'); args.push(`%${search}%`); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const countRes = await libsql.execute({ sql: `SELECT COUNT(*) AS total FROM Tarea t ${where}`, args });
    const total = Number(countRes.rows[0]?.total ?? 0);

    const result = await libsql.execute({
      sql: `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.prioridad,
          t.fechaLimite, t.fechaCompletada, t.contactoId, t.createdAt,
          c.name AS contactoNombre, c.primaryPhone AS contactoTelefono
        FROM Tarea t
        LEFT JOIN Contact c ON t.contactoId = c.id
        ${where}
        ORDER BY CASE t.prioridad WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 WHEN 'BAJA' THEN 3 ELSE 4 END, t.fechaLimite ASC, t.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      tareas: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[vendedor/tareas GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
