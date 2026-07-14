// PUT    /api/admin/empresas/[id] — actualizar empresa (solo ADMIN)
// DELETE /api/admin/empresas/[id] — soft-delete (isActive=0) (solo ADMIN)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nombre, email, telefono, direccion } = body;

    const libsql = getTursoClient();
    await libsql.execute({
      sql: `UPDATE "Empresa" SET
              nombre = COALESCE(?, nombre),
              email = COALESCE(?, email),
              telefono = COALESCE(?, telefono),
              direccion = COALESCE(?, direccion),
              updatedAt = datetime('now')
            WHERE id = ?`,
      args: [
        nombre || null,
        email ? email.toLowerCase() : null,
        telefono || null,
        direccion || null,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/empresas PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const libsql = getTursoClient();

    // Soft-delete: desactivar en lugar de borrar (preserva integridad referencial)
    await libsql.execute({
      sql: `UPDATE "Empresa" SET "isActive" = 0, updatedAt = datetime('now') WHERE id = ?`,
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/empresas DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
