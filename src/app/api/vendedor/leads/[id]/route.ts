// PATCH /api/vendedor/leads/[id] — cambiar estado de un lead del vendedor
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

const VALID_STATUS = ['NUEVO', 'LEIDO', 'EN_CONTACTO', 'REUNION', 'PRESUPUESTO', 'ATENDIDO', 'RECHAZADO'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const libsql = getTursoClient();

    // Verificar que el lead pertenece al vendedor
    const check = await libsql.execute({
      sql: 'SELECT ownerId FROM Contact WHERE id = ?',
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    if ((check.rows[0] as Record<string, unknown>).ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar este lead' }, { status: 403 });
    }

    if (!body.status || !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    await libsql.execute({
      sql: 'UPDATE Contact SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      args: [body.status, id],
    });

    // Registrar actividad
    const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [actId, id, session.user.id, body.status, `Estado actualizado a ${body.status}`],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[vendedor/leads/[id] PATCH] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
