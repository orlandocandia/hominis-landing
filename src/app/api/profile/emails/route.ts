// GET/POST /api/profile/emails
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_TYPES = ['PERSONAL', 'LABORAL', 'ALTERNATIVO', 'OTRO'];

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: 'SELECT id, email, emailType, isPrimary, isVerified, notes, createdAt FROM UserEmail WHERE userId = ? ORDER BY isPrimary DESC, createdAt ASC',
      args: [session.user.id],
    });
    return NextResponse.json({ emails: result.rows });
  } catch (e: any) {
    console.error('[emails GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = await request.json();
    const { email, emailType, isPrimary, notes } = body;
    if (!email || !emailType) return NextResponse.json({ error: 'email y emailType son obligatorios' }, { status: 400 });
    if (!VALID_TYPES.includes(emailType)) return NextResponse.json({ error: 'emailType inválido' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });

    const libsql = getTursoClient();
    const id = 'email_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (isPrimary) {
      await libsql.execute({ sql: 'UPDATE UserEmail SET isPrimary = 0 WHERE userId = ?', args: [session.user.id] });
    }
    await libsql.execute({
      sql: `INSERT INTO UserEmail (id, userId, email, emailType, isPrimary, isVerified, notes, updatedAt)
        VALUES (?, ?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP)`,
      args: [id, session.user.id, email.toLowerCase(), emailType, isPrimary ? 1 : 0, notes || null],
    });
    return NextResponse.json({ id, email, emailType, isPrimary: !!isPrimary });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 });
    console.error('[emails POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
