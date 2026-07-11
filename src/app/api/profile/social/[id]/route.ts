// PUT/DELETE /api/profile/social/[id]
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE', 'TELEGRAM', 'DISCORD', 'SNAPCHAT', 'OTRO'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { platform, username, url, isPrimary, notes } = body;
    if (!platform || !username) return NextResponse.json({ error: 'platform y username son obligatorios' }, { status: 400 });
    if (!VALID_PLATFORMS.includes(platform)) return NextResponse.json({ error: 'platform inválido' }, { status: 400 });

    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT userId FROM UserSocialNetwork WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (existing.rows[0].userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    if (isPrimary) {
      const ownerId = existing.rows[0].userId as string;
      await libsql.execute({ sql: 'UPDATE UserSocialNetwork SET isPrimary = 0 WHERE userId = ?', args: [ownerId] });
    }
    await libsql.execute({
      sql: `UPDATE UserSocialNetwork SET platform = ?, username = ?, url = ?, isPrimary = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [platform, username, url || null, isPrimary ? 1 : 0, notes || null, id],
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Esa red social ya está registrada' }, { status: 409 });
    console.error('[social PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT userId FROM UserSocialNetwork WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (existing.rows[0].userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    await libsql.execute({ sql: 'DELETE FROM UserSocialNetwork WHERE id = ?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[social DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
