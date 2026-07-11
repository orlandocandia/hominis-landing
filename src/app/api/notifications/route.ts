// GET /api/notifications — list current user's notifications (unread first)
// DELETE /api/notifications — mark all as read
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT * FROM Notification WHERE userId = ? ORDER BY read ASC, createdAt DESC LIMIT 50`,
      args: [session.user.id],
    });
    const unreadRes = await libsql.execute({
      sql: 'SELECT COUNT(*) as n FROM Notification WHERE userId = ? AND read = 0',
      args: [session.user.id],
    });
    const unread = Number((unreadRes.rows[0] as any).n);
    return NextResponse.json({ notifications: result.rows, unread });
  } catch (e: any) {
    console.error('[notifications GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const libsql = getTursoClient();
    await libsql.execute({
      sql: 'UPDATE Notification SET read = 1 WHERE userId = ? AND read = 0',
      args: [session.user.id],
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[notifications DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
