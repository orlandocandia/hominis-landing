// PUT    /api/admin/empresas/[id] — actualizar empresa (solo ADMIN)
// DELETE /api/admin/empresas/[id] — eliminar empresa (solo si no tiene vendedores)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
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
    const { nombre, email, telefono, direccion, activo } = body;

    const libsql = getTursoClient();

    // activo (del frontend, boolean) → isActive (columna real, INTEGER 0/1)
    const isActiveVal = activo === true ? 1 : activo === false ? 0 : null;

    await libsql.execute({
      sql: `UPDATE "Empresa" SET
        nombre = COALESCE(?, nombre),
        email = COALESCE(?, email),
        telefono = COALESCE(?, telefono),
        direccion = COALESCE(?, direccion),
        "isActive" = COALESCE(?, "isActive"),
        updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?`,
      args: [
        nombre || null,
        email ? email.toLowerCase() : null,
        telefono ?? null,
        direccion ?? null,
        isActiveVal,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/empresas/[id] PUT] error:', e);
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

    const { id } = await params;
    const libsql = getTursoClient();

    // Verificar si tiene vendedores asignados
    const check = await libsql.execute({
      sql: `SELECT COUNT(*) AS total FROM "User" WHERE empresaId = ? AND rol = 'VENDEDOR'`,
      args: [id],
    });
    const total = Number((check.rows[0] as Record<string, unknown>)?.total ?? 0);

    if (total > 0) {
      return new Response(
        `No se puede eliminar: tiene ${total} vendedor(es) asignado(s). Reasignalos primero.`,
        { status: 400 }
      );
    }

    // Soft-delete: desactivar en lugar de borrar (preserva integridad referencial)
    await libsql.execute({
      sql: `UPDATE "Empresa" SET "isActive" = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/empresas/[id] DELETE] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
