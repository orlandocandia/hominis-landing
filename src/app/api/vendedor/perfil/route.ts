// GET /api/vendedor/perfil — obtener datos del perfil
// PUT /api/vendedor/perfil — actualizar perfil
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT u.id, u.nombre, u.email, u.telefono, u."avatarUrl", u."empresaId",
        e.nombre AS empresaNombre
        FROM "User" u LEFT JOIN "Empresa" e ON u."empresaId" = e.id
        WHERE u.id = ?`,
      args: [session.user.id],
    });

    if (result.rows.length === 0) {
      return new Response('No encontrado', { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (e: unknown) {
    console.error('[vendedor/perfil GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const libsql = getTursoClient();

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (body.nombre) { updates.push('nombre = ?'); args.push(body.nombre); }
    if (body.telefono !== undefined) { updates.push('telefono = ?'); args.push(body.telefono || null); }
    if (body.avatarUrl !== undefined) { updates.push('"avatarUrl" = ?'); args.push(body.avatarUrl || null); }
    if (body.password) {
      if (body.password.length < 6) {
        return new Response('La contraseña debe tener al menos 6 caracteres', { status: 400 });
      }
      const passwordHash = await bcrypt.hash(body.password, 12);
      updates.push('password = ?');
      args.push(passwordHash);
    }

    if (updates.length === 0) {
      return new Response('No hay datos para actualizar', { status: 400 });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(session.user.id);

    await libsql.execute({ sql: `UPDATE "User" SET ${updates.join(', ')} WHERE id = ?`, args });

    const result = await libsql.execute({
      sql: 'SELECT id, nombre, email, telefono, "avatarUrl" FROM "User" WHERE id = ?',
      args: [session.user.id],
    });

    return NextResponse.json(result.rows[0]);
  } catch (e: unknown) {
    console.error('[vendedor/perfil PUT] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
