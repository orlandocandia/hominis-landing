// GET/PUT/DELETE /api/admin/users/[id]
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import bcrypt from 'bcryptjs';
import { geocodeAddress } from '@/lib/geocoding';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const libsql = getTursoClient();
    const userRes = await libsql.execute({
      sql: `SELECT id, email, nombre, apellido, rol, activo, address, city, province, postalCode,
        latitude, longitude, geocodingStatus, serviceRadius, coverageAreas, documentNumber,
        totalContacts, conversionRate, fechaAlta, ultimoAcceso, avatarUrl
        FROM "User" WHERE id = ?`,
      args: [id],
    });
    if (userRes.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const phones = await libsql.execute({ sql: 'SELECT id, phoneNumber, phoneType, isPrimary, isWhatsapp, notes FROM UserPhone WHERE userId = ? ORDER BY isPrimary DESC', args: [id] });
    const emails = await libsql.execute({ sql: 'SELECT id, email, emailType, isPrimary FROM UserEmail WHERE userId = ? ORDER BY isPrimary DESC', args: [id] });
    return NextResponse.json({ user: userRes.rows[0], phones: phones.rows, emails: emails.rows });
  } catch (e: any) {
    console.error('[user GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const { nombre, apellido, rol, activo, address, city, province, serviceRadius, password, phone } = body;

    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT id, address FROM "User" WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    // Geocode if address changed
    let lat: number | null = null;
    let lng: number | null = null;
    let geocodingStatus = 'PENDING';
    let finalCity = city || null;
    let finalProvince = province || null;
    const oldAddress = existing.rows[0].address as string | null;
    if (address && address !== oldAddress) {
      try {
        const geo = await geocodeAddress(address);
        if (geo) {
          lat = geo.latitude;
          lng = geo.longitude;
          geocodingStatus = 'SUCCESS';
          if (!finalCity && geo.city) finalCity = geo.city;
          if (!finalProvince && geo.province) finalProvince = geo.province;
        } else { geocodingStatus = 'FAILED'; }
      } catch { geocodingStatus = 'FAILED'; }
    }

    // Build update
    const sets: string[] = [];
    const args: any[] = [];
    if (nombre !== undefined) { sets.push('nombre = ?'); args.push(nombre); }
    if (apellido !== undefined) { sets.push('apellido = ?'); args.push(apellido); }
    if (rol !== undefined && ['VENDEDOR', 'PRODUCTOR', 'ADMIN'].includes(rol)) { sets.push('rol = ?'); args.push(rol); }
    if (activo !== undefined) { sets.push('activo = ?'); args.push(activo ? 1 : 0); }
    if (address !== undefined) { sets.push('address = ?'); args.push(address || null); }
    if (city !== undefined) { sets.push('city = ?'); args.push(finalCity); }
    if (province !== undefined) { sets.push('province = ?'); args.push(finalProvince); }
    if (serviceRadius !== undefined) { sets.push('serviceRadius = ?'); args.push(serviceRadius); }
    if (lat !== null) { sets.push('latitude = ?'); args.push(lat); }
    if (lng !== null) { sets.push('longitude = ?'); args.push(lng); }
    if (geocodingStatus !== 'PENDING') { sets.push('geocodingStatus = ?'); args.push(geocodingStatus); }
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: 'Contraseña mínima: 6 caracteres' }, { status: 400 });
      const hash = await bcrypt.hash(password, 12);
      sets.push('password = ?'); args.push(hash);
    }
    if (sets.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    sets.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);
    await libsql.execute({ sql: `UPDATE "User" SET ${sets.join(', ')} WHERE id = ?`, args });

    // Update phone if provided
    if (phone) {
      const phoneRes = await libsql.execute({ sql: 'SELECT id FROM UserPhone WHERE userId = ? AND isPrimary = 1 LIMIT 1', args: [id] });
      if (phoneRes.rows.length > 0) {
        await libsql.execute({ sql: 'UPDATE UserPhone SET phoneNumber = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', args: [phone, phoneRes.rows[0].id] });
      } else {
        const phoneId = 'phone_' + Date.now().toString(36);
        await libsql.execute({
          sql: `INSERT INTO UserPhone (id, userId, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, updatedAt) VALUES (?, ?, ?, 'WHATSAPP', 1, 1, 0, CURRENT_TIMESTAMP)`,
          args: [phoneId, id, phone],
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[user PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const libsql = getTursoClient();
    // Prevent self-delete
    if (id === session.user.id) return NextResponse.json({ error: 'No podés eliminar tu propia cuenta' }, { status: 400 });
    const existing = await libsql.execute({ sql: 'SELECT id, rol FROM "User" WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    // Check no contacts assigned
    const contactsRes = await libsql.execute({ sql: 'SELECT COUNT(*) as n FROM Contact WHERE ownerId = ?', args: [id] });
    const n = Number((contactsRes.rows[0] as any).n);
    if (n > 0) return NextResponse.json({ error: `No se puede eliminar: tiene ${n} contactos asignados. Reasignalos primero.` }, { status: 409 });
    await libsql.execute({ sql: 'DELETE FROM "User" WHERE id = ?', args: [id] });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[user DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
