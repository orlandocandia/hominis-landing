// GET /api/profile/phones — list current user's phones
// POST /api/profile/phones — add a phone
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_TYPES = ['PERSONAL', 'LABORAL', 'WHATSAPP', 'URGENCIAS', 'OTRO'];

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: 'SELECT id, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, notes, createdAt FROM UserPhone WHERE userId = ? ORDER BY isPrimary DESC, createdAt ASC',
      args: [session.user.id],
    });
    return NextResponse.json({ phones: result.rows });
  } catch (e: any) {
    console.error('[phones GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = await request.json();
    const { phoneNumber, phoneType, isPrimary, isWhatsapp, notes } = body;
    if (!phoneNumber || !phoneType) return NextResponse.json({ error: 'phoneNumber y phoneType son obligatorios' }, { status: 400 });
    if (!VALID_TYPES.includes(phoneType)) return NextResponse.json({ error: 'phoneType inválido' }, { status: 400 });

    const libsql = getTursoClient();
    const id = 'phone_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // If marking as primary, unset others
    if (isPrimary) {
      await libsql.execute({ sql: 'UPDATE UserPhone SET isPrimary = 0 WHERE userId = ?', args: [session.user.id] });
    }
    await libsql.execute({
      sql: `INSERT INTO UserPhone (id, userId, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, notes, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP)`,
      args: [id, session.user.id, phoneNumber, phoneType, isPrimary ? 1 : 0, isWhatsapp ? 1 : 0, notes || null],
    });
    return NextResponse.json({ id, phoneNumber, phoneType, isPrimary: !!isPrimary, isWhatsapp: !!isWhatsapp });
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Ese teléfono ya está registrado' }, { status: 409 });
    console.error('[phones POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
