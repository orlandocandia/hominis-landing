// PATCH /api/contacts/[id] - Update contact status
// DELETE /api/contacts/[id] - Delete a contact
// Protected: requires authentication
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { estado, nota } = body;

    const validEstados = ['NUEVO', 'LEIDO', 'ATENDIDO'];
    if (estado && !validEstados.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Valores permitidos: NUEVO, LEIDO, ATENDIDO' },
        { status: 400 }
      );
    }

    const libsql = getTursoClient();

    // Multiempresa: verificar que el contacto pertenece a la empresa del usuario
    const empresaFiltro = session.user.empresaId || null;

    // Check contact exists (and belongs to user's empresa if not admin)
    const existing = await libsql.execute({
      sql: empresaFiltro
        ? 'SELECT id FROM Contacto WHERE id = ? AND empresaId = ?'
        : 'SELECT id FROM Contacto WHERE id = ?',
      args: empresaFiltro ? [id, empresaFiltro] : [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    // Update
    const now = new Date().toISOString();
    if (estado) {
      await libsql.execute({
        sql: 'UPDATE Contacto SET estado = ?, updatedAt = ? WHERE id = ?',
        args: [estado, now, id],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contacts API] Error updating:', error);
    return NextResponse.json({ error: 'Error al actualizar contacto' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const libsql = getTursoClient();

    // Multiempresa: verificar pertenencia a la empresa
    const empresaFiltro = session.user.empresaId || null;

    const existing = await libsql.execute({
      sql: empresaFiltro
        ? 'SELECT id FROM Contacto WHERE id = ? AND empresaId = ?'
        : 'SELECT id FROM Contacto WHERE id = ?',
      args: empresaFiltro ? [id, empresaFiltro] : [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    await libsql.execute({
      sql: empresaFiltro
        ? 'DELETE FROM Contacto WHERE id = ? AND empresaId = ?'
        : 'DELETE FROM Contacto WHERE id = ?',
      args: empresaFiltro ? [id, empresaFiltro] : [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contacts API] Error deleting:', error);
    return NextResponse.json({ error: 'Error al eliminar contacto' }, { status: 500 });
  }
}


