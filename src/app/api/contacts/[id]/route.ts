// PATCH /api/contacts/[id] - Update contact status
// Protected: requires authentication
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { sanitizeString } from '@/lib/sanitize';

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

    // Validate estado
    const validEstados = ['NUEVO', 'LEIDO', 'ATENDIDO'];
    if (estado && !validEstados.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Valores permitidos: NUEVO, LEIDO, ATENDIDO' },
        { status: 400 }
      );
    }

    // Check contact exists
    const existing = await db.contacto.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    // Update
    const updateData: Record<string, unknown> = {};
    if (estado) updateData.estado = estado;
    if (nota !== undefined) updateData.nota = sanitizeString(nota);

    const updated = await db.contacto.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, contact: updated });
  } catch (error) {
    console.error('[Contacts API] Error updating:', error);
    return NextResponse.json(
      { error: 'Error al actualizar contacto' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a contact
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

    // Check contact exists
    const existing = await db.contacto.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      );
    }

    await db.contacto.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contacts API] Error deleting:', error);
    return NextResponse.json(
      { error: 'Error al eliminar contacto' },
      { status: 500 }
    );
  }
}
