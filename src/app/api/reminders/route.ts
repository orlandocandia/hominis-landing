// GET /api/reminders — list current user's reminders (upcoming first)
// POST /api/reminders — create a reminder for a contact
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_TYPES = ['CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'VISITA', 'TAREA', 'OTHER'];

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const showCompleted = searchParams.get('completed') === 'true';

    const libsql = getTursoClient();
    let sql = `SELECT r.*, c.name as contactName
      FROM "Reminder" r
      JOIN Contact c ON r.contactId = c.id
      WHERE r.userId = ?`;
    const args: any[] = [session.user.id];
    if (!showCompleted) { sql += ' AND r.isCompleted = 0'; }
    if (contactId) { sql += ' AND r.contactId = ?'; args.push(contactId); }
    sql += ' ORDER BY r.isCompleted ASC, r.reminderDate ASC LIMIT 100';
    const result = await libsql.execute({ sql, args });
    return NextResponse.json({ reminders: result.rows });
  } catch (e: any) {
    console.error('[reminders GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { contactId, reminderDate, title, description, type } = body;
    if (!contactId || !reminderDate || !title || !type) {
      return NextResponse.json({ error: 'contactId, reminderDate, title y type son obligatorios' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'type inválido (CALL, EMAIL, MEETING, OTHER)' }, { status: 400 });
    }

    const libsql = getTursoClient();
    // Verify access: vendedor must own the contact
    const contactRes = await libsql.execute({ sql: 'SELECT ownerId FROM Contact WHERE id = ?', args: [contactId] });
    if (contactRes.rows.length === 0) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    if (session.user.role === 'VENDEDOR' && contactRes.rows[0].ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const id = 'rem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO "Reminder" (id, contactId, userId, reminderDate, title, description, type, isCompleted, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      args: [id, contactId, session.user.id, new Date(reminderDate).toISOString(), title, description || null, type],
    });

    return NextResponse.json({ id, contactId, reminderDate, title, type });
  } catch (e: any) {
    console.error('[reminders POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
