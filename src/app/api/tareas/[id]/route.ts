// PUT /api/tareas/[id] — update task (admin or assigned vendor)
// DELETE /api/tareas/[id] — delete task (admin only)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const libsql = getTursoClient();

    const existing = await libsql.execute({ sql: 'SELECT asignadoA, estado FROM "Tarea" WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });

    if (session.user.role !== 'ADMIN' && existing.rows[0].asignadoA !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const sets: string[] = [];
    const args: any[] = [];
    if (body.titulo !== undefined) { sets.push('titulo = ?'); args.push(body.titulo); }
    if (body.descripcion !== undefined) { sets.push('descripcion = ?'); args.push(body.descripcion); }
    if (body.estado !== undefined && VALID_ESTADOS.includes(body.estado)) {
      sets.push('estado = ?'); args.push(body.estado);
      if (body.estado === 'COMPLETADA' && existing.rows[0].estado !== 'COMPLETADA') {
        sets.push('fechaCompletada = CURRENT_TIMESTAMP');
      }
    }
    if (body.fechaLimite !== undefined) { sets.push('fechaLimite = ?'); args.push(new Date(body.fechaLimite).toISOString()); }
    if (sets.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    sets.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);

    await libsql.execute({ sql: `UPDATE "Tarea" SET ${sets.join(', ')} WHERE id = ?`, args });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[tarea PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const libsql = getTursoClient();
    await libsql.execute({ sql: 'DELETE FROM "Tarea" WHERE id = ?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[tarea DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
