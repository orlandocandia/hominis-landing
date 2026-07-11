// GET /api/invitations/[token] — verify token validity (public, for registration page)
// POST /api/invitations/[token] — complete registration (create user)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import bcrypt from 'bcryptjs';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT i.email, i.role, i.expiresAt, i.usedAt
        FROM Invitation i WHERE i.token = ? LIMIT 1`,
      args: [token],
    });
    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Token inválido' }, { status: 404 });
    }
    const inv = result.rows[0] as any;
    if (inv.usedAt) return NextResponse.json({ valid: false, error: 'Esta invitación ya fue usada' }, { status: 410 });
    if (new Date(inv.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Esta invitación expiró' }, { status: 410 });
    }
    return NextResponse.json({
      valid: true,
      email: inv.email,
      role: inv.role,
      expiresAt: inv.expiresAt,
    });
  } catch (e: any) {
    console.error('[invitation verify GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { nombre, apellido, password, phone, address } = body;

    if (!nombre || !password) {
      return NextResponse.json({ error: 'nombre y password son obligatorios' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const libsql = getTursoClient();
    // Verify token
    const invRes = await libsql.execute({
      sql: `SELECT id, email, role, expiresAt, usedAt FROM Invitation WHERE token = ?`,
      args: [token],
    });
    if (invRes.rows.length === 0) return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    const inv = invRes.rows[0] as any;
    if (inv.usedAt) return NextResponse.json({ error: 'Invitación ya usada' }, { status: 410 });
    if (new Date(inv.expiresAt) < new Date()) return NextResponse.json({ error: 'Invitación expirada' }, { status: 410 });

    // Check email not taken
    const existing = await libsql.execute({ sql: 'SELECT id FROM "User" WHERE email = ?', args: [inv.email] });
    if (existing.rows.length > 0) return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });

    const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Geocode address if provided
    let lat: number | null = null;
    let lng: number | null = null;
    let geocodingStatus = 'PENDING';
    let city: string | null = null;
    let province: string | null = null;
    if (address) {
      try {
        const { geocodeAddress } = await import('@/lib/geocoding');
        const geo = await geocodeAddress(address);
        if (geo) {
          lat = geo.latitude; lng = geo.longitude; geocodingStatus = 'SUCCESS';
          city = geo.city || null; province = geo.province || null;
        } else { geocodingStatus = 'FAILED'; }
      } catch { geocodingStatus = 'FAILED'; }
    }

    await libsql.execute({
      sql: `INSERT INTO "User" (id, email, password, nombre, apellido, rol, activo, fechaAlta,
        address, city, province, latitude, longitude, geocodingStatus, serviceRadius)
        VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, 50)`,
      args: [id, inv.email, hashedPassword, nombre, apellido || null, inv.role,
        address || null, city, province, lat, lng, geocodingStatus],
    });

    // Add phone if provided
    if (phone) {
      const phoneId = 'phone_' + Date.now().toString(36);
      await libsql.execute({
        sql: `INSERT INTO UserPhone (id, userId, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, updatedAt)
          VALUES (?, ?, ?, 'WHATSAPP', 1, 1, 0, CURRENT_TIMESTAMP)`,
        args: [phoneId, id, phone],
      });
    }

    // Mark invitation as used
    await libsql.execute({
      sql: 'UPDATE Invitation SET usedAt = CURRENT_TIMESTAMP WHERE id = ?',
      args: [inv.id],
    });

    return NextResponse.json({ ok: true, email: inv.email, role: inv.role });
  } catch (e: any) {
    console.error('[invitation register POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
