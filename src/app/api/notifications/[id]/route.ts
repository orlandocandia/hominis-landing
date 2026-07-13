// PATCH /api/notifications/[id] — mark a single notification as read
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const libsql = getTursoClient();
    // Verify ownership
    const existing = await libsql.execute({ sql: 'SELECT userId FROM Notification WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    if (existing.rows[0].userId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    await libsql.execute({ sql: 'UPDATE Notification SET read = 1 WHERE id = ?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[notification PATCH] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

