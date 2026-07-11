// PATCH /api/reminders/[id] — mark as complete/incomplete
// DELETE /api/reminders/[id] — delete a reminder
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const isCompleted = !!body.isCompleted;

    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT userId FROM "Reminder" WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (existing.rows[0].userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

    await libsql.execute({
      sql: 'UPDATE "Reminder" SET isCompleted = ?, completedAt = ? WHERE id = ?',
      args: [isCompleted ? 1 : 0, isCompleted ? new Date().toISOString() : null, id],
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[reminder PATCH] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT userId FROM "Reminder" WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (existing.rows[0].userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    await libsql.execute({ sql: 'DELETE FROM "Reminder" WHERE id = ?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[reminder DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
