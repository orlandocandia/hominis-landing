// GET/PUT/DELETE /api/crm/contacts/[id]
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import { geocodeAddress } from '@/lib/geocoding';

const VALID_SEGMENTS = ['RECIBO_DE_SUELDO', 'MONOTRIBUTO', 'PARTICULAR'];
const VALID_COVERAGE = ['CABA', 'GBA'];
const VALID_STATUS = ['NUEVO', 'LEIDO', 'EN_CONTACTO', 'REUNION', 'PRESUPUESTO', 'ATENDIDO', 'RECHAZADO'];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const libsql = getTursoClient();
    const contactRes = await libsql.execute({
      sql: `SELECT c.*, u.nombre as ownerNombre, u.apellido as ownerApellido
        FROM Contact c LEFT JOIN "User" u ON c.ownerId = u.id WHERE c.id = ?`,
      args: [id],
    });
    if (contactRes.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const contact = contactRes.rows[0] as any;

    // VENDEDOR can only see their own
    if (session.user.role === 'VENDEDOR' && contact.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const [phones, emails, socials, activities] = await Promise.all([
      libsql.execute({ sql: 'SELECT * FROM ContactPhone WHERE contactId = ? ORDER BY isPrimary DESC', args: [id] }),
      libsql.execute({ sql: 'SELECT * FROM ContactEmail WHERE contactId = ? ORDER BY isPrimary DESC', args: [id] }),
      libsql.execute({ sql: 'SELECT * FROM ContactSocialNetwork WHERE contactId = ?', args: [id] }),
      libsql.execute({
        sql: `SELECT a.*, u.nombre, u.apellido FROM ContactActivity a
          LEFT JOIN "User" u ON a.userId = u.id
          WHERE a.contactId = ? ORDER BY a.createdAt DESC LIMIT 50`,
        args: [id],
      }),
    ]);
    return NextResponse.json({ contact, phones: phones.rows, emails: emails.rows, socials: socials.rows, activities: activities.rows });
  } catch (e: any) {
    console.error('[crm/contact GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { name, address, primaryEmail, primaryPhone, segment, coverage, age, message, status, ownerId, serviceRadius } = body;

    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT * FROM Contact WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const old = existing.rows[0] as any;

    // VENDEDOR can only edit their own, and cannot reassign
    if (session.user.role === 'VENDEDOR') {
      if (old.ownerId !== session.user.id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Geocode if address changed
    let lat = old.latitude ?? 0;
    let lng = old.longitude ?? 0;
    let geocodingStatus = old.geocodingStatus;
    let city = old.city;
    let province = old.province;
    if (address && address !== old.address) {
      try {
        const geo = await geocodeAddress(address);
        if (geo) {
          lat = geo.latitude; lng = geo.longitude; geocodingStatus = 'SUCCESS';
          city = geo.city || city; province = geo.province || province;
        } else { geocodingStatus = 'FAILED'; }
      } catch { geocodingStatus = 'FAILED'; }
    }

    const sets: string[] = [];
    const args: any[] = [];
    if (name !== undefined) { sets.push('name = ?'); args.push(name); }
    if (address !== undefined) { sets.push('address = ?'); args.push(address); sets.push('city = ?'); args.push(city); sets.push('province = ?'); args.push(province); }
    if (primaryEmail !== undefined) { sets.push('primaryEmail = ?'); args.push(primaryEmail || null); }
    if (primaryPhone !== undefined) { sets.push('primaryPhone = ?'); args.push(primaryPhone || null); }
    if (segment !== undefined && (segment === null || VALID_SEGMENTS.includes(segment))) { sets.push('segment = ?'); args.push(segment); }
    if (coverage !== undefined && (coverage === null || VALID_COVERAGE.includes(coverage))) { sets.push('coverage = ?'); args.push(coverage); }
    if (age !== undefined) { sets.push('age = ?'); args.push(age || null); }
    if (message !== undefined) { sets.push('message = ?'); args.push(message || null); }
    if (lat !== null) { sets.push('latitude = ?'); args.push(lat); }
    if (lng !== null) { sets.push('longitude = ?'); args.push(lng); }
    if (geocodingStatus) { sets.push('geocodingStatus = ?'); args.push(geocodingStatus); }

    // Status change → log activity + update owner metrics
    if (status && VALID_STATUS.includes(status) && status !== old.status) {
      sets.push('status = ?'); args.push(status);
      // Log activity
      const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        args: [actId, id, session.user.id, status, 'Estado actualizado'],
      });
      // Update owner metrics (replaces the trigger logic)
      await libsql.execute({
        sql: `UPDATE "User" SET
          totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?),
          conversionRate = (
            SELECT ROUND(100.0 * SUM(CASE WHEN status = 'ATENDIDO' THEN 1 ELSE 0 END) / COUNT(*), 2)
            FROM Contact WHERE ownerId = ?
          ), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [old.ownerId, old.ownerId, old.ownerId],
      });
      // Recalculate lead score (RECHAZADO resets score to 0)
      try {
        const { LeadScoringService } = await import('@/lib/services/lead-scoring.service');
        await LeadScoringService.scoreContact(id);
      } catch (e) {
        console.warn('[crm/contact PUT] lead score recalculation failed:', e);
      }
    }

    // Reassignment (ADMIN/PRODUCTOR only)
    if (ownerId && ownerId !== old.ownerId && (session.user.role === 'ADMIN' || session.user.role === 'PRODUCTOR')) {
      sets.push('ownerId = ?'); args.push(ownerId);
      sets.push('assignedBy = ?'); args.push(session.user.id);
      sets.push('assignedAt = CURRENT_TIMESTAMP');
      const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt) VALUES (?, ?, ?, 'NOTA', ?, CURRENT_TIMESTAMP)`,
        args: [actId, id, session.user.id, `Reasignado por ${session.user.name}`],
      });
      // Update both old and new owner metrics
      for (const uid of [old.ownerId, ownerId]) {
        await libsql.execute({
          sql: `UPDATE "User" SET totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          args: [uid, uid],
        });
      }
    }

    if (sets.length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    sets.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);
    await libsql.execute({ sql: `UPDATE Contact SET ${sets.join(', ')} WHERE id = ?`, args });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[crm/contact PUT] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role === 'VENDEDOR') return NextResponse.json({ error: 'Forbidden: solo admin/productor pueden eliminar' }, { status: 403 });
    const { id } = await params;
    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT ownerId FROM Contact WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    const ownerId = (existing.rows[0] as any).ownerId;
    await libsql.execute({ sql: 'DELETE FROM Contact WHERE id = ?', args: [id] });
    // Update owner metrics
    await libsql.execute({
      sql: `UPDATE "User" SET totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [ownerId, ownerId],
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[crm/contact DELETE] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
