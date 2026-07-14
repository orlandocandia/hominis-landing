// GET    /api/admin/tareas/[id] — detalle de una tarea
// PATCH  /api/admin/tareas/[id] — actualizar tarea
// DELETE /api/admin/tareas/[id] — eliminar tarea
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const libsql = getTursoClient();

    const result = await libsql.execute({
      sql: `SELECT t.*, u.nombre AS vendedorNombre, u.apellido AS vendedorApellido, u.email AS vendedorEmail,
          c.nombre AS contactoNombre, c.telefono AS contactoTelefono
        FROM Tarea t
        LEFT JOIN "User" u ON t.asignadoA = u.id
        LEFT JOIN Contacto c ON t.contactoId = c.id
        WHERE t.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return new Response('Tarea no encontrada', { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (e: unknown) {
    console.error('[admin/tareas/[id] GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const libsql = getTursoClient();

    // Verificar que existe
    const existing = await libsql.execute({
      sql: 'SELECT id, estado, contactoId, titulo FROM Tarea WHERE id = ?',
      args: [id],
    });
    if (existing.rows.length === 0) {
      return new Response('Tarea no encontrada', { status: 404 });
    }
    const tarea = existing.rows[0] as Record<string, unknown>;

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (body.titulo) { updates.push('titulo = ?'); args.push(body.titulo); }
    if (body.descripcion !== undefined) { updates.push('descripcion = ?'); args.push(body.descripcion); }
    if (body.tipo) { updates.push('tipo = ?'); args.push(body.tipo); }
    if (body.prioridad) { updates.push('prioridad = ?'); args.push(body.prioridad); }
    if (body.estado && VALID_ESTADOS.includes(body.estado)) {
      updates.push('estado = ?'); args.push(body.estado);
    }
    if (body.fechaLimite) { updates.push('fechaLimite = ?'); args.push(new Date(body.fechaLimite).toISOString()); }
    if (body.asignadoA) { updates.push('asignadoA = ?'); args.push(body.asignadoA); }
    if (body.contactoId !== undefined) { updates.push('contactoId = ?'); args.push(body.contactoId || null); }

    if (updates.length === 0) {
      return new Response('No hay datos para actualizar', { status: 400 });
    }

    // Si se completa, setear fechaCompletada + registrar actividad
    if (body.estado === 'COMPLETADA' && tarea.estado !== 'COMPLETADA') {
      updates.push('fechaCompletada = CURRENT_TIMESTAMP');
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);

    await libsql.execute({
      sql: `UPDATE Tarea SET ${updates.join(', ')} WHERE id = ?`,
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
    console.error('[admin/tareas/[id] PATCH] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const libsql = getTursoClient();
    await libsql.execute({ sql: 'DELETE FROM Tarea WHERE id = ?', args: [id] });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/tareas/[id] DELETE] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
