// GET/POST /api/profile/social
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_PLATFORMS = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'TIKTOK', 'YOUTUBE', 'TELEGRAM', 'DISCORD', 'SNAPCHAT', 'OTRO'];

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: 'SELECT id, platform, username, url, isPrimary, notes, createdAt FROM UserSocialNetwork WHERE userId = ? ORDER BY isPrimary DESC, createdAt ASC',
      args: [session.user.id],
    });
    return NextResponse.json({ social: result.rows });
  } catch (e: any) {
    console.error('[social GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = await request.json();
    const { platform, username, url, isPrimary, notes } = body;
    if (!platform || !username) return NextResponse.json({ error: 'platform y username son obligatorios' }, { status: 400 });
    if (!VALID_PLATFORMS.includes(platform)) return NextResponse.json({ error: 'platform inválido' }, { status: 400 });

    const libsql = getTursoClient();
    const id = 'social_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (isPrimary) {
      await libsql.execute({ sql: 'UPDATE UserSocialNetwork SET isPrimary = 0 WHERE userId = ?', args: [session.user.id] });
    }
    await libsql.execute({
      sql: `INSERT INTO UserSocialNetwork (id, userId, platform, username, url, isPrimary, notes, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [id, session.user.id, platform, username, url || null, isPrimary ? 1 : 0, notes || null],
    });
    return NextResponse.json({ id, platform, username, url, isPrimary: !!isPrimary });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Esa red social ya está registrada' }, { status: 409 });
    console.error('[social POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
