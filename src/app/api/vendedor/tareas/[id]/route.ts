// PATCH /api/vendedor/tareas/[id] — actualizar estado de una tarea (completar, etc.)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

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

    // Verificar que la tarea pertenece al vendedor
    const check = await libsql.execute({
      sql: 'SELECT asignadoA, estado, contactoId, titulo FROM Tarea WHERE id = ?',
      args: [id],
    });

    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    const tarea = check.rows[0] as Record<string, unknown>;
    if (tarea.asignadoA !== session.user.id) {
      return NextResponse.json({ error: 'No tienes permiso para modificar esta tarea' }, { status: 403 });
    }

    if (!body.estado || !VALID_ESTADOS.includes(body.estado)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    const sets: string[] = ['estado = ?', 'updatedAt = CURRENT_TIMESTAMP'];
    const args: (string | number)[] = [body.estado];

    // Si se completó, setear fechaCompletada
    if (body.estado === 'COMPLETADA' && tarea.estado !== 'COMPLETADA') {
      sets.push('fechaCompletada = CURRENT_TIMESTAMP');
    }

    args.push(id);

    await libsql.execute({
      sql: `UPDATE Tarea SET ${sets.join(', ')} WHERE id = ?`,
      args,
    });

    // Si se completó y tiene contacto, registrar actividad
    if (body.estado === 'COMPLETADA' && tarea.contactoId) {
      const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
          VALUES (?, ?, ?, 'NOTA', ?, CURRENT_TIMESTAMP)`,
        args: [actId, tarea.contactoId, session.user.id, `Tarea completada: ${tarea.titulo ?? ''}`],
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[vendedor/tareas/[id] PATCH] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
