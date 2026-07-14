// GET  /api/admin/users — lista paginada de vendedores con métricas
// POST /api/admin/users — crear nuevo vendedor
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = ['u.rol = \'VENDEDOR\''];
    const args: (string | number)[] = [];

    // Multiempresa: filtrar por empresa de la sesión
    if (empresaId) {
      conditions.push('u.empresaId = ?');
      args.push(empresaId);
    }
    if (search) {
      conditions.push('(u.nombre LIKE ? OR u.email LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat);
    }

    const where = 'WHERE ' + conditions.join(' AND ');

    // Count total
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS total FROM "User" u ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    // Vendedores con métricas (Contact tiene ownerId, Contacto no)
    const result = await libsql.execute({
      sql: `SELECT u.id, u.nombre, u.email, u.telefono, u."avatarUrl", u.activo,
          e.nombre AS empresaNombre,
          (SELECT COUNT(*) FROM "Contact" c WHERE c.ownerId = u.id) AS totalLeads,
          (SELECT COUNT(*) FROM "Contact" c WHERE c.ownerId = u.id AND c.status = 'ATENDIDO') AS leadsAtendidos,
          (SELECT COUNT(*) FROM Tarea t WHERE t.asignadoA = u.id AND t.estado IN ('PENDIENTE','EN_PROGRESO')) AS tareasPendientes,
          (SELECT COUNT(*) FROM Tarea t WHERE t.asignadoA = u.id AND t.estado = 'COMPLETADA') AS tareasCompletadas
        FROM "User" u
        LEFT JOIN "Empresa" e ON u.empresaId = e.id
        ${where}
        ORDER BY u.nombre ASC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      users: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[admin/users GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { nombre, email, password, telefono, empresaId } = body;

    if (!nombre || !email || !password || !empresaId) {
      return new Response('Nombre, email, contraseña y empresa son requeridos', { status: 400 });
    }
    if (password.length < 6) {
      return new Response('La contraseña debe tener al menos 6 caracteres', { status: 400 });
    }

    const libsql = getTursoClient();

    // Verificar email no duplicado
    const existing = await libsql.execute({
      sql: 'SELECT id FROM "User" WHERE email = ?',
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return new Response('Ya existe un usuario con ese email', { status: 409 });
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const passwordHash = await bcrypt.hash(password, 12);

    await libsql.execute({
      sql: `INSERT INTO "User" (id, email, password, nombre, rol, empresaId, telefono, "avatarUrl", activo, fechaAlta, updatedAt)
        VALUES (?, ?, ?, ?, 'VENDEDOR', ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        userId,
        email.toLowerCase(),
        passwordHash,
        nombre,
        empresaId,
        telefono || null,
        body.avatarUrl || null,
      ],
    });

    return NextResponse.json({ id: userId, nombre, email }, { status: 201 });
  } catch (e: unknown) {
    console.error('[admin/users POST] error:', e);
    const msg = e instanceof Error ? e.message : 'Error interno';
    return new Response(msg, { status: 500 });
  }
}
