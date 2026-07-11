// GET /api/admin/invitations — list all invitations
// POST /api/admin/invitations — create + send invitation email
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import { sendInvitationEmail } from '@/lib/notifications/email';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT i.id, i.email, i.role, i.token, i.expiresAt, i.usedAt, i.createdAt,
        u.nombre as invitedByNombre, u.apellido as invitedByApellido
        FROM Invitation i
        LEFT JOIN "User" u ON i.invitedBy = u.id
        ORDER BY i.createdAt DESC LIMIT 100`,
    });
    return NextResponse.json({ invitations: result.rows });
  } catch (e: any) {
    console.error('[invitations GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { email, role } = body;
    if (!email || !role) return NextResponse.json({ error: 'email y role son obligatorios' }, { status: 400 });
    if (!['VENDEDOR', 'PRODUCTOR'].includes(role)) return NextResponse.json({ error: 'role inválido' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });

    const libsql = getTursoClient();
    // Check if email already registered as a user
    const existingUser = await libsql.execute({ sql: 'SELECT id FROM "User" WHERE email = ?', args: [email.toLowerCase()] });
    if (existingUser.rows.length > 0) return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });

    // Check for existing pending invitation
    const existingInv = await libsql.execute({
      sql: "SELECT id, expiresAt FROM Invitation WHERE email = ? AND usedAt IS NULL AND expiresAt > CURRENT_TIMESTAMP",
      args: [email.toLowerCase()],
    });
    if (existingInv.rows.length > 0) {
      return NextResponse.json({ error: 'Ya hay una invitación pendiente para ese email. Cancelala o esperá a que expire.' }, { status: 409 });
    }

    const id = 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await libsql.execute({
      sql: `INSERT INTO Invitation (id, email, role, token, invitedBy, expiresAt, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [id, email.toLowerCase(), role, token, session.user.id, expiresAt],
    });

    // Send email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.asesoradesalud.com.ar';
    const inviterName = session.user.name || 'Administrador';
    const emailSent = await sendInvitationEmail({
      to: email,
      inviteeName: email.split('@')[0], // placeholder until they register their name
      inviterName,
      role,
      token,
      baseUrl,
    });

    // Create in-app notification for the admin
    const notifId = 'notif_' + Date.now().toString(36);
    await libsql.execute({
      sql: `INSERT INTO Notification (id, userId, type, title, message, link, createdAt)
        VALUES (?, ?, 'SYSTEM', ?, ?, '/admin/invitaciones', CURRENT_TIMESTAMP)`,
      args: [notifId, session.user.id, 'Invitación enviada', `Invitación a ${email} como ${role}${emailSent ? ' (email enviado)' : ' (email falló — compartí el link manualmente)'}`],
    });

    return NextResponse.json({ id, token, emailSent, registerUrl: `${baseUrl}/register?token=${token}` });
  } catch (e: any) {
    console.error('[invitations POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
