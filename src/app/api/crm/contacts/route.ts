// GET /api/crm/contacts — list contacts (filtered by role/owner)
// POST /api/crm/contacts — create a new contact (with auto-assignment)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import { geocodeAddress } from '@/lib/geocoding';
import { assignContact, recordAssignment } from '@/lib/assignment';

const VALID_SEGMENTS = ['RECIBO_DE_SUELDO', 'MONOTRIBUTO', 'PARTICULAR'];
const VALID_COVERAGE = ['CABA', 'GBA'];
const VALID_STATUS = ['NUEVO', 'LEIDO', 'ATENDIDO', 'RECHAZADO'];

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const libsql = getTursoClient();
    const conditions: string[] = [];
    const args: any[] = [];

    // Role-based filtering: VENDEDOR sees only their own; PRODUCTOR sees their own + team (all); ADMIN sees all
    if (session.user.role === 'VENDEDOR') {
      conditions.push('c.ownerId = ?');
      args.push(session.user.id);
    } else if (session.user.role === 'PRODUCTOR') {
      // Productor sees all (team view) unless ownerId filter
      if (ownerId) { conditions.push('c.ownerId = ?'); args.push(ownerId); }
    } else if (ownerId) {
      conditions.push('c.ownerId = ?');
      args.push(ownerId);
    }

    if (status && VALID_STATUS.includes(status)) {
      conditions.push('c.status = ?');
      args.push(status);
    }
    if (search) {
      conditions.push('(c.name LIKE ? OR c.primaryEmail LIKE ? OR c.primaryPhone LIKE ? OR c.address LIKE ?)');
      const s = `%${search}%`;
      args.push(s, s, s, s);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await libsql.execute({
      sql: `SELECT c.*, u.nombre as ownerNombre, u.apellido as ownerApellido
        FROM Contact c
        LEFT JOIN "User" u ON c.ownerId = u.id
        ${where}
        ORDER BY c.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) as total FROM Contact c ${where}`,
      args,
    });
    const total = Number((countRes.rows[0] as any).total);
    return NextResponse.json({
      contacts: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: any) {
    console.error('[crm/contacts GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { name, address, primaryEmail, primaryPhone, segment, coverage, age, message, phones, emails, assignMethod, manualOwnerId } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'name y address son obligatorios' }, { status: 400 });
    }

    const libsql = getTursoClient();

    // Geocode address
    let lat: number | null = null;
    let lng: number | null = null;
    let geocodingStatus = 'PENDING';
    let city: string | null = null;
    let province: string | null = null;
    try {
      const geo = await geocodeAddress(address);
      if (geo) {
        lat = geo.latitude;
        lng = geo.longitude;
        geocodingStatus = 'SUCCESS';
        city = geo.city || null;
        province = geo.province || null;
      } else { geocodingStatus = 'FAILED'; }
    } catch { geocodingStatus = 'FAILED'; }

    // Determine owner: MANUAL (admin/productor) or AUTO (assignment engine)
    let ownerId: string;
    let assignmentResult = null;
    if (manualOwnerId) {
      // Verify the owner exists and is a vendor/productor
      const ownerRes = await libsql.execute({
        sql: `SELECT id FROM "User" WHERE id = ? AND rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1`,
        args: [manualOwnerId],
      });
      if (ownerRes.rows.length === 0) return NextResponse.json({ error: 'Vendedor asignado no válido' }, { status: 400 });
      ownerId = manualOwnerId;
    } else {
      assignmentResult = await assignContact({
        method: assignMethod || 'ROUND_ROBIN',
        contactLat: lat ?? undefined,
        contactLng: lng ?? undefined,
      });
      if (!assignmentResult) return NextResponse.json({ error: 'No hay vendedores activos para asignar' }, { status: 400 });
      ownerId = assignmentResult.userId;
    }

    const contactId = 'ct_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    await libsql.execute({
      sql: `INSERT INTO Contact (id, name, primaryEmail, primaryPhone, address, city, province,
        latitude, longitude, geocodingStatus, segment, age, coverage, message, status,
        ownerId, assignedBy, assignedAt, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NUEVO', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        contactId, name, primaryEmail || null, primaryPhone || null,
        address, city, province, lat, lng, geocodingStatus,
        segment && VALID_SEGMENTS.includes(segment) ? segment : null,
        age || null,
        coverage && VALID_COVERAGE.includes(coverage) ? coverage : null,
        message || null,
        ownerId, session.user.id,
      ],
    });

    // Insert multichannel phones/emails if provided
    if (Array.isArray(phones)) {
      for (const p of phones) {
        if (!p.phoneNumber) continue;
        const pid = 'cp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO ContactPhone (id, contactId, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          args: [pid, contactId, p.phoneNumber, p.phoneType || 'PERSONAL', p.isPrimary ? 1 : 0, p.isWhatsapp ? 1 : 0],
        });
      }
    }
    if (Array.isArray(emails)) {
      for (const em of emails) {
        if (!em.email) continue;
        const eid = 'ce_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO ContactEmail (id, contactId, email, emailType, isPrimary, isVerified, updatedAt)
            VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          args: [eid, contactId, em.email.toLowerCase(), em.emailType || 'PERSONAL', em.isPrimary ? 1 : 0],
        });
      }
    }

    // Record assignment + log activity
    if (assignmentResult) {
      await recordAssignment(contactId, session.user.id, assignmentResult);
    } else {
      // Manual assignment → still log a CREADO activity
      const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
          VALUES (?, ?, ?, 'CREADO', 'Contacto creado y asignado manualmente', CURRENT_TIMESTAMP)`,
        args: [actId, contactId, session.user.id],
      });
    }

    // Update owner's totalContacts
    await libsql.execute({
      sql: `UPDATE "User" SET totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [ownerId, ownerId],
    });

    return NextResponse.json({
      id: contactId,
      ownerId,
      assignment: assignmentResult,
      geocodingStatus,
      latitude: lat,
      longitude: lng,
    });
  } catch (e: any) {
    console.error('[crm/contacts POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
