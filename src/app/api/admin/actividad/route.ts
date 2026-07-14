// GET /api/admin/actividad — historial paginado de ContactActivity con filtros.
// Multiempresa: filtra por empresa via JOIN del User (ContactActivity no tiene empresaId).
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

const ACTION_LABELS: Record<string, string> = {
  CREADO: '📝 Creó lead',
  NUEVO: '🆕 Lead nuevo',
  LEIDO: '👀 Marcó como leído',
  EN_CONTACTO: '💬 En contacto',
  REUNION: '🤝 Reunión agendada',
  PRESUPUESTO: '💰 Presupuesto enviado',
  ATENDIDO: '✅ Marcó como atendido',
  RECHAZADO: '❌ Rechazó lead',
  TAREA_COMPLETADA: '🎯 Completó tarea',
  WHATSAPP: '💬 Envió WhatsApp',
  LLAMADA: '📞 Realizó llamada',
  EMAIL: '✉️ Envió email',
  VISITA: '📍 Registró visita',
  NOTA: '📋 Agregó nota',
  REASIGNACION: '🔄 Reasignó lead',
};

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    const action = searchParams.get('action');
    const vendedorId = searchParams.get('vendedorId');
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    // Multiempresa: filtrar por empresa del User que hizo la acción
    // (ContactActivity no tiene empresaId, pero User sí)
    if (empresaId) {
      conditions.push('u.empresaId = ?');
      args.push(empresaId);
    }
    if (action) { conditions.push('ca.action = ?'); args.push(action); }
    if (vendedorId) { conditions.push('ca.userId = ?'); args.push(vendedorId); }
    if (search) {
      conditions.push('(u.nombre LIKE ? OR c.name LIKE ? OR ca.note LIKE ?)');
      const pat = `%${search}%`;
      args.push(pat, pat, pat);
    }
    if (fechaDesde) { conditions.push('ca.createdAt >= ?'); args.push(fechaDesde); }
    if (fechaHasta) { conditions.push('ca.createdAt <= ?'); args.push(fechaHasta + ' 23:59:59'); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS total
        FROM ContactActivity ca
        LEFT JOIN "User" u ON ca.userId = u.id
        LEFT JOIN "Contact" c ON ca.contactId = c.id
        ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    // Actividades (alias: u.nombre AS userName, c.name AS contactName)
    const result = await libsql.execute({
      sql: `SELECT ca.id, ca.contactId, ca.userId, ca.action, ca.note, ca.metadata, ca.createdAt,
          u.nombre AS userName, u.apellido AS userApellido, u.email AS userEmail,
          c.name AS contactName, c.primaryPhone AS contactPhone, c.primaryEmail AS contactEmail
        FROM ContactActivity ca
        LEFT JOIN "User" u ON ca.userId = u.id
        LEFT JOIN "Contact" c ON ca.contactId = c.id
        ${where}
        ORDER BY ca.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      actividades: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      actionLabels: ACTION_LABELS,
    });
  } catch (e: unknown) {
    console.error('[admin/actividad GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
