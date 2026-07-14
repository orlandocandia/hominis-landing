// PATCH /api/admin/leads/[id] — cambiar estado de un lead
// DELETE /api/admin/leads/[id] — eliminar un lead
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['NUEVO', 'LEIDO', 'ATENDIDO', 'RECHAZADO'];

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
    const { action } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response('Acción no válida', { status: 400 });
    }

    const libsql = getTursoClient();
    const empresaId = session.user.empresaId || null;

    // Verificar pertenencia a la empresa (seguridad multiempresa)
    const existing = await libsql.execute({
      sql: empresaId
        ? 'SELECT id FROM Contacto WHERE id = ? AND empresaId = ?'
        : 'SELECT id FROM Contacto WHERE id = ?',
      args: empresaId ? [id, empresaId] : [id],
    });

    if (existing.rows.length === 0) {
      return new Response('Lead no encontrado', { status: 404 });
    }

    await libsql.execute({
      sql: 'UPDATE Contacto SET estado = ? WHERE id = ?',
      args: [action, id],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/leads/[id] PATCH] error:', e);
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
    const empresaId = session.user.empresaId || null;

    await libsql.execute({
      sql: empresaId
        ? 'DELETE FROM Contacto WHERE id = ? AND empresaId = ?'
        : 'DELETE FROM Contacto WHERE id = ?',
      args: empresaId ? [id, empresaId] : [id],
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/leads/[id] DELETE] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
