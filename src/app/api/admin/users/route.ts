// GET /api/admin/users — list users (vendedores/productores)
// POST /api/admin/users — create a new vendedor/productor
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import bcrypt from 'bcryptjs';
import { geocodeAddress } from '@/lib/geocoding';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'VENDEDOR' | 'PRODUCTOR' | null (all)

    const libsql = getTursoClient();
    let sql = `SELECT id, email, nombre, apellido, rol, activo, city, province, latitude, longitude,
      serviceRadius, totalContacts, conversionRate, fechaAlta, ultimoAcceso, avatarUrl
      FROM "User" WHERE rol IN ('VENDEDOR', 'PRODUCTOR')`;
    const args: string[] = [];
    if (role && ['VENDEDOR', 'PRODUCTOR'].includes(role)) {
      sql += ' AND rol = ?';
      args.push(role);
    }
    sql += ' ORDER BY fechaAlta DESC';
    const result = await libsql.execute({ sql, args });
    return NextResponse.json({ users: result.rows });
  } catch (e: any) {
    console.error('[users GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { email, password, nombre, apellido, rol, address, city, province, phone, serviceRadius } = body;

    // Validation
    if (!email || !password || !nombre || !rol) {
      return NextResponse.json({ error: 'email, password, nombre y rol son obligatorios' }, { status: 400 });
    }
    if (!['VENDEDOR', 'PRODUCTOR'].includes(rol)) {
      return NextResponse.json({ error: 'rol debe ser VENDEDOR o PRODUCTOR' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const libsql = getTursoClient();

    // Check email not taken
    const existing = await libsql.execute({ sql: 'SELECT id FROM "User" WHERE email = ?', args: [email.toLowerCase()] });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    // Geocode address if provided
    let lat: number | null = null;
    let lng: number | null = null;
    let geocodingStatus = 'PENDING';
    let finalCity = city || null;
    let finalProvince = province || null;
    if (address) {
      try {
        const geo = await geocodeAddress(address);
        if (geo) {
          lat = geo.latitude;
          lng = geo.longitude;
          geocodingStatus = 'SUCCESS';
          if (!finalCity && geo.city) finalCity = geo.city;
          if (!finalProvince && geo.province) finalProvince = geo.province;
        } else {
          geocodingStatus = 'FAILED';
        }
      } catch {
        geocodingStatus = 'FAILED';
      }
    }

    const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const hashedPassword = await bcrypt.hash(password, 12);

    await libsql.execute({
      sql: `INSERT INTO "User" (id, email, password, nombre, apellido, rol, activo, fechaAlta,
        address, city, province, latitude, longitude, geocodingStatus, serviceRadius)
        VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, email.toLowerCase(), hashedPassword, nombre, apellido || null, rol,
        address || null, finalCity, finalProvince,
        lat, lng, geocodingStatus, serviceRadius || 50,
      ],
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

    return NextResponse.json({ id, email, nombre, rol, latitude: lat, longitude: lng, geocodingStatus });
  } catch (e: any) {
    console.error('[users POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
