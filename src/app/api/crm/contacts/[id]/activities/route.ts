// GET /api/crm/contacts/[id]/activities — list activities for a contact
// POST /api/crm/contacts/[id]/activities — add a note/call/visit activity
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_ACTIONS = ['NOTA', 'LLAMADA', 'WHATSAPP', 'EMAIL', 'VISITA', 'LEIDO', 'ATENDIDO', 'RECHAZADO'];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT a.*, u.nombre, u.apellido FROM ContactActivity a
        LEFT JOIN "User" u ON a.userId = u.id
        WHERE a.contactId = ? ORDER BY a.createdAt DESC`,
      args: [id],
    });
    return NextResponse.json({ activities: result.rows });
  } catch (e: any) {
    console.error('[activities GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { action, note, metadata } = body;
    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'action inválido' }, { status: 400 });
    }
    const libsql = getTursoClient();
    // Verify contact exists + access (vendedor only their own)
    const contactRes = await libsql.execute({ sql: 'SELECT ownerId, status FROM Contact WHERE id = ?', args: [id] });
    if (contactRes.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const ownerId = (contactRes.rows[0] as any).ownerId;
    if (session.user.role === 'VENDEDOR' && ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, metadata, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [actId, id, session.user.id, action, note || null, metadata ? JSON.stringify(metadata) : null],
    });
    // If action is a status change, update contact + owner metrics
    if (['LEIDO', 'ATENDIDO', 'RECHAZADO'].includes(action)) {
      await libsql.execute({ sql: 'UPDATE Contact SET status = ?, lastContact = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', args: [action, id] });
      await libsql.execute({
        sql: `UPDATE "User" SET
          totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?),
          conversionRate = (SELECT ROUND(100.0 * SUM(CASE WHEN status = 'ATENDIDO' THEN 1 ELSE 0 END) / COUNT(*), 2) FROM Contact WHERE ownerId = ?),
          updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [ownerId, ownerId, ownerId],
      });
    } else {
      await libsql.execute({ sql: 'UPDATE Contact SET lastContact = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', args: [id] });
    }
    return NextResponse.json({ id: actId });
  } catch (e: any) {
    console.error('[activities POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
