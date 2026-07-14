// PATCH /api/vendedor/tareas/[id] — cambiar estado de una tarea (completar, etc.)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const libsql = getTursoClient();

    // Verificar que la tarea pertenece al vendedor
    const check = await libsql.execute({
      sql: 'SELECT asignadoA, estado, contactoId, titulo FROM Tarea WHERE id = ?',
      args: [id],
    });

    if (check.rows.length === 0) {
      return new Response('Tarea no encontrada', { status: 404 });
    }

    const tarea = check.rows[0] as Record<string, unknown>;
    if (tarea.asignadoA !== session.user.id) {
      return new Response('No tienes permiso para modificar esta tarea', { status: 403 });
    }

    if (!body.estado || !VALID_ESTADOS.includes(body.estado)) {
      return new Response('Estado no válido', { status: 400 });
    }

    const sets: string[] = ['estado = ?', 'updatedAt = CURRENT_TIMESTAMP'];
    const args: (string | number)[] = [body.estado];

    if (body.estado === 'COMPLETADA' && tarea.estado !== 'COMPLETADA') {
      sets.push('fechaCompletada = CURRENT_TIMESTAMP');
    }
    args.push(id);

    await libsql.execute({ sql: `UPDATE Tarea SET ${sets.join(', ')} WHERE id = ?`, args });

    // Si se completó y tiene contacto, registrar actividad
    if (body.estado === 'COMPLETADA' && tarea.contactoId) {
      const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
          VALUES (?, ?, ?, 'NOTA', ?, CURRENT_TIMESTAMP)`,
        args: [actId, tarea.contactoId, session.user.id, `Tarea completada: ${tarea.titulo ?? ''}`],
      });
    }

    // Si se completó, notificar al admin por email
    if (body.estado === 'COMPLETADA' && tarea.estado !== 'COMPLETADA') {
      try {
        const adminRes = await libsql.execute({
          sql: `SELECT email FROM "User" WHERE rol = 'ADMIN' LIMIT 1`,
        });
        const adminEmail = (adminRes.rows[0] as Record<string, unknown>)?.email as string | undefined;
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `✅ Tarea completada: ${tarea.titulo ?? ''}`,
            html: `
              <h1>Tarea completada</h1>
              <p><strong>Vendedor:</strong> ${session.user.name || 'Vendedor'}</p>
              <p><strong>Tarea:</strong> ${tarea.titulo ?? ''}</p>
              <p><a href="https://asesoradesalud.com.ar/admin/tareas">Ver en el sistema →</a></p>
            `,
          });
        }
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[vendedor/tareas/[id] PATCH] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

