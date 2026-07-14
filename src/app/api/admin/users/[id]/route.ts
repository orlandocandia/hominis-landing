// GET    /api/admin/users/[id] — obtener un vendedor
// PATCH  /api/admin/users/[id] — actualizar parcialmente
// DELETE /api/admin/users/[id] — eliminar (solo si no tiene leads/tareas)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const libsql = getTursoClient();

    const result = await libsql.execute({
      sql: `SELECT u.id, u.nombre, u.email, u.telefono, u."avatarUrl", u.activo,
          u.empresaId, e.nombre AS empresaNombre, u.fechaAlta
        FROM "User" u
        LEFT JOIN "Empresa" e ON u.empresaId = e.id
        WHERE u.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return new Response('Usuario no encontrado', { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (e: unknown) {
    console.error('[admin/users/[id] GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const libsql = getTursoClient();

    // Verificar que existe
    const existing = await libsql.execute({
      sql: 'SELECT id FROM "User" WHERE id = ?',
      args: [id],
    });
    if (existing.rows.length === 0) {
      return new Response('Usuario no encontrado', { status: 404 });
    }

    const updates: string[] = [];
    const args: (string | number)[] = [];

    if (body.nombre) { updates.push('nombre = ?'); args.push(body.nombre); }
    if (body.email) { updates.push('email = ?'); args.push(String(body.email).toLowerCase()); }
    if (body.telefono !== undefined) { updates.push('telefono = ?'); args.push(body.telefono || null); }
    if (body.empresaId) { updates.push('empresaId = ?'); args.push(body.empresaId); }
    if (body.avatarUrl !== undefined) { updates.push('"avatarUrl" = ?'); args.push(body.avatarUrl || null); }
    if (body.activo !== undefined) { updates.push('activo = ?'); args.push(body.activo ? 1 : 0); }
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
    args.push(id);

    await libsql.execute({
      sql: `UPDATE "User" SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/users/[id] PATCH] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    // Prevenir auto-eliminación
    const { id } = await params;
    if (id === session.user.id) {
      return new Response('No podés eliminar tu propia cuenta', { status: 400 });
    }

    const libsql = getTursoClient();

    // Verificar si tiene leads (Contact) o tareas activas
    const check = await libsql.execute({
      sql: `SELECT
        (SELECT COUNT(*) FROM "Contact" WHERE ownerId = ?) AS contacts,
        (SELECT COUNT(*) FROM Tarea WHERE asignadoA = ? AND estado != 'COMPLETADA') AS tareas`,
      args: [id, id],
    });
    const row = check.rows[0] as Record<string, unknown>;
    const contacts = Number(row?.contacts ?? 0);
    const tareas = Number(row?.tareas ?? 0);

    if (contacts > 0) {
      return new Response(`No se puede eliminar: tiene ${contacts} lead(s) asignado(s). Reasignalos primero.`, { status: 400 });
    }
    if (tareas > 0) {
      return new Response(`No se puede eliminar: tiene ${tareas} tarea(s) pendiente(s).`, { status: 400 });
    }

    await libsql.execute({
      sql: 'DELETE FROM "User" WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/users/[id] DELETE] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
