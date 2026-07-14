// POST /api/admin/leads/bulk — acciones masivas sobre múltiples leads
// body: { action: 'LEIDO' | 'ATENDIDO' | 'RECHAZADO' | 'DELETE', leadIds: string[] }
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['LEIDO', 'ATENDIDO', 'RECHAZADO', 'DELETE'];

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { action, leadIds } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new Response('Acción no válida', { status: 400 });
    }
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return new Response('No se seleccionaron leads', { status: 400 });
    }

    const libsql = getTursoClient();
    const empresaId = session.user.empresaId || null;
    const placeholders = leadIds.map(() => '?').join(',');

    if (action === 'DELETE') {
      if (empresaId) {
        await libsql.execute({
          sql: `DELETE FROM Contacto WHERE id IN (${placeholders}) AND empresaId = ?`,
          args: [...leadIds, empresaId],
        });
      } else {
        await libsql.execute({
          sql: `DELETE FROM Contacto WHERE id IN (${placeholders})`,
          args: leadIds,
        });
      }
    } else {
      if (empresaId) {
        await libsql.execute({
          sql: `UPDATE Contacto SET estado = ? WHERE id IN (${placeholders}) AND empresaId = ?`,
          args: [action, ...leadIds, empresaId],
        });
      } else {
        await libsql.execute({
          sql: `UPDATE Contacto SET estado = ? WHERE id IN (${placeholders})`,
          args: [action, ...leadIds],
        });
      }
    }

    return NextResponse.json({ success: true, affected: leadIds.length });
  } catch (e: unknown) {
    console.error('[admin/leads/bulk POST] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}
