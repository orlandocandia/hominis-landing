// GET /api/admin/users — list vendedores (paginado + métricas + multiempresa)
// POST /api/admin/users — create a new vendedor
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    // Multiempresa: la empresa activa viene de la sesión
    const empresaFiltro = session.user.empresaId || null;

    const libsql = getTursoClient();

    // Construir filtros
    const conditions: string[] = ['u.rol = 'VENDEDOR''];
    const args: (string | number)[] = [];

    if (empresaFiltro) {
      conditions.push('u.empresaId = ?');
      args.push(empresaFiltro);
    }
    if (search) {
      conditions.push('(u.nombre LIKE ? OR u.email LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat);
    }

    const whereSQL = 'WHERE ' + conditions.join(' AND ');

    // Contar total
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS total FROM "User" u ${whereSQL}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    // Obtener vendedores con métricas (alias para compatibilidad con frontend)
    const result = await libsql.execute({
      sql: `SELECT u.id, u.nombre AS name, u.apellido, u.email, u.telefono, u.avatarUrl,
          u.activo AS isActive, u.empresaId, u.city, u.province,
          e.nombre AS empresaNombre,
          (SELECT COUNT(*) FROM Contact c WHERE c.ownerId = u.id) AS totalLeads,
          (SELECT COUNT(*) FROM Contact c WHERE c.ownerId = u.id AND c.status = 'ATENDIDO') AS leadsAtendidos,
          (SELECT COUNT(*) FROM Tarea t WHERE t.asignadoA = u.id AND t.estado IN ('PENDIENTE','EN_PROGRESO')) AS tareasPendientes,
          (SELECT COUNT(*) FROM Tarea t WHERE t.asignadoA = u.id AND t.estado = 'COMPLETADA') AS tareasCompletadas
        FROM "User" u
        LEFT JOIN "Empresa" e ON u.empresaId = e.id
        ${whereSQL}
        ORDER BY u.nombre ASC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      users: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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
    const { email, password, nombre, apellido, rol, address, city, province, phone, serviceRadius, empresaId } = body;
    // Multiempresa: asignar empresa al nuevo vendedor (del body, o heredar la del admin)
    const nuevoEmpresaId = session.user.empresaId || empresaId || null;

    // Validation
    if (!email || !password || !nombre || !rol) {
      return NextResponse.json({ error: 'email, password, nombre y rol son obligatorios' }, { status: 400 });
    }
    if (rol !== 'VENDEDOR') {
      return NextResponse.json({ error: 'rol debe ser VENDEDOR' }, { status: 400 });
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
        address, city, province, latitude, longitude, geocodingStatus, serviceRadius, coverageAreas, empresaId)
        VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, email.toLowerCase(), hashedPassword, nombre, apellido || null, rol,
        address || null, finalCity, finalProvince,
        lat, lng, geocodingStatus, serviceRadius || 50,
        body.coverageAreas ? JSON.stringify(body.coverageAreas) : null,
        nuevoEmpresaId,
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




