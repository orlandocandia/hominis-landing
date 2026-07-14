// GET  /api/vendedor/perfil — obtener datos del perfil del vendedor
// PUT  /api/vendedor/perfil — actualizar perfil (nombre, telefono, avatarUrl, password)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT id, nombre, email, telefono, "avatarUrl", "empresaId",
        e.nombre AS empresaNombre
        FROM "User" u
        LEFT JOIN "Empresa" e ON u."empresaId" = e.id
        WHERE u.id = ?`,
      args: [session.user.id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const row = result.rows[0] as Record<string, unknown>;
    return NextResponse.json({
      id: row.id,
      name: row.nombre, // alias for frontend
      email: row.email,
      telefono: row.telefono || '',
      avatarUrl: row.avatarUrl || '',
      empresaNombre: row.empresaNombre || null,
    });
  } catch (e: unknown) {
    console.error('[vendedor/perfil GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const libsql = getTursoClient();

    const updates: string[] = [];
    const args: (string | number)[] = [];

    // Mapear campos del frontend a columnas reales
    if (body.name) { updates.push('nombre = ?'); args.push(body.name); }
    if (body.telefono !== undefined) { updates.push('telefono = ?'); args.push(body.telefono); }
    if (body.avatarUrl !== undefined) { updates.push('"avatarUrl" = ?'); args.push(body.avatarUrl || null); }
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(body.password, 12);
      updates.push('password = ?');
      args.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(session.user.id);

    await libsql.execute({
      sql: `UPDATE "User" SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    // Devolver usuario actualizado
    const result = await libsql.execute({
      sql: `SELECT id, nombre, email, telefono, "avatarUrl"
        FROM "User" WHERE id = ?`,
      args: [session.user.id],
    });

    const row = result.rows[0] as Record<string, unknown>;
    return NextResponse.json({
      id: row.id,
      name: row.nombre,
      email: row.email,
      telefono: row.telefono || '',
      avatarUrl: row.avatarUrl || '',
    });
  } catch (e: unknown) {
    console.error('[vendedor/perfil PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
