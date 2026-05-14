// PATCH /api/contacts/[id] - Update contact status
// DELETE /api/contacts/[id] - Delete a contact
// Protected: requires authentication
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';

function getTursoClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');
  return createClient({
    url: process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
}

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

    // Check contact exists
    const existing = await libsql.execute({
      sql: 'SELECT id FROM Contacto WHERE id = ?',
      args: [id],
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

    const existing = await libsql.execute({
      sql: 'SELECT id FROM Contacto WHERE id = ?',
      args: [id],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    await libsql.execute({
      sql: 'DELETE FROM Contacto WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contacts API] Error deleting:', error);
    return NextResponse.json({ error: 'Error al eliminar contacto' }, { status: 500 });
  }
}
