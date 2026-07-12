// POST /api/leads - Create a new lead (Contacto)
// Uses raw SQL via Turso (no Prisma dependency)
// Sends email + WhatsApp notifications to Agustina
import { NextResponse } from 'next/server';
import { verifyCsrf } from '@/lib/csrf';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  validateSegmento,
  validateCobertura,
  validateAge,
} from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendNewContactEmail } from '@/lib/notifications/email';
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';
import { getTursoClient } from '@/lib/turso-config';

export async function POST(request: Request) {
  try {
    const csrfValid = await verifyCsrf(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Token de seguridad inválido. Recargá la página e intentá de nuevo.' },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Por favor, esperá unos minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const nombre = sanitizeString(body.nombre);
    const email = sanitizeEmail(body.email);
    const telefono = sanitizePhone(body.telefono);
    const segmento = validateSegmento(body.segmento);
    const mensaje = sanitizeString(body.mensaje);
    const cobertura = validateCobertura(body.cobertura);
    const edad = validateAge(body.edad);

    const errors: string[] = [];
    if (!nombre || nombre.length < 2) errors.push('El nombre es obligatorio');
    if (!email) errors.push('El email no es válido');
    if (!telefono || telefono.length < 6) errors.push('El teléfono es obligatorio');
    if (!segmento) errors.push('Seleccioná un segmento válido');
    if (edad === null && body.edad !== undefined && body.edad !== '') errors.push('La edad no es válida');

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('. ') }, { status: 400 });
    }

    // 1. Store in Contacto (legacy table — for backwards compat)
    const libsql = getTursoClient();
    const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    // Build origen with UTM + referrer (marketing analytics)
    const utmSource = body.utmSource || '';
    const utmMedium = body.utmMedium || '';
    const utmCampaign = body.utmCampaign || '';
    const utmTerm = body.utmTerm || '';
    const utmContent = body.utmContent || '';
    const referrer = body.referrer || '';
    const userAgent = body.userAgent || '';
    const origenData: string[] = ['landing'];
    if (utmSource) origenData.push(`utm_source=${utmSource}`);
    if (utmMedium) origenData.push(`utm_medium=${utmMedium}`);
    if (utmCampaign) origenData.push(`utm_campaign=${utmCampaign}`);
    if (utmTerm) origenData.push(`utm_term=${utmTerm}`);
    if (utmContent) origenData.push(`utm_content=${utmContent}`);
    const origen = origenData.join('|');

    await libsql.execute({
      sql: `INSERT INTO Contacto (id, nombre, email, telefono, segmento, mensaje, cobertura, edad, origen, ip, estado, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nombre, email, telefono, segmento, mensaje || null, cobertura || null, edad || null, origen, clientIp, 'NUEVO', now, now],
    });

    // 1b. ALSO store in Contact (CRM table — visible in /admin/contactos)
    // This is the bridge that makes leads visible in the admin panel.
    const contactId = 'ct_lead_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const segmentCrm = segmento === 'RECIBO_DE_SUELDO' ? 'RECIBO_DE_SUELDO'
      : segmento === 'MONOTRIBUTO' ? 'MONOTRIBUTO'
      : segmento === 'PARTICULAR' ? 'PARTICULAR' : null;
    const coverageCrm = cobertura === 'CABA' ? 'CABA' : cobertura === 'GBA' ? 'GBA' : null;

    // Geocode the lead's area (use coverage as proxy for address since landing form doesn't send address)
    let lat = 0, lng = 0;
    try {
      const { geocodeAddress } = await import('@/lib/geocoding');
      const geoQuery = cobertura === 'CABA' ? 'Buenos Aires, CABA, Argentina' : 'Lomas de Zamora, GBA, Argentina';
      const geo = await geocodeAddress(geoQuery);
      if (geo) { lat = geo.latitude; lng = geo.longitude; }
    } catch {}

    // Assign to admin by default (landing leads go to admin, who can reassign)
    const adminRes = await libsql.execute({ sql: "SELECT id FROM \"User\" WHERE rol = 'ADMIN' AND activo = 1 LIMIT 1" });
    const adminId = adminRes.rows.length > 0 ? (adminRes.rows[0] as any).id : 'admin_001';

    // Resolve sourceId from utm_source
    let sourceId: string | null = null;
    if (utmSource) {
      try {
        const srcRes = await libsql.execute({ sql: 'SELECT id FROM "LeadSource" WHERE name = ? AND isActive = 1 LIMIT 1', args: [utmSource] });
        if (srcRes.rows.length > 0) sourceId = srcRes.rows[0].id as string;
      } catch {}
    }

    await libsql.execute({
      sql: `INSERT INTO Contact (id, name, primaryEmail, primaryPhone, address, city, province,
        latitude, longitude, geocodingStatus, segment, age, coverage, message, status,
        ownerId, assignedBy, assignedAt, createdAt, updatedAt,
        sourceId, sourceUtmSource, sourceUtmMedium, sourceUtmCampaign, sourceUtmTerm, sourceUtmContent, sourceReferrer, sourceUserAgent, sourceIp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NUEVO', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        contactId, nombre, email || null, telefono,
        cobertura === 'CABA' ? 'CABA, Buenos Aires' : 'GBA, Buenos Aires',
        cobertura === 'CABA' ? 'CABA' : 'Lomas de Zamora',
        'Buenos Aires',
        lat, lng, lat !== 0 ? 'SUCCESS' : 'PENDING',
        segmentCrm, edad || null, coverageCrm, mensaje || null,
        adminId, adminId,
        sourceId, utmSource || null, utmMedium || null, utmCampaign || null,
        utmTerm || null, utmContent || null, referrer || null, userAgent || null, clientIp,
      ],
    });

    // Auto-score the lead
    try {
      const { LeadScoringService } = await import('@/lib/services/lead-scoring.service');
      await LeadScoringService.scoreContact(contactId);
    } catch (e) { console.warn('[leads] lead scoring failed:', e); }

    // Schedule follow-ups
    try {
      const { FollowupService } = await import('@/lib/services/followup.service');
      await FollowupService.scheduleFollowups(contactId, adminId);
    } catch (e) { console.warn('[leads] followup scheduling failed:', e); }

    // Track source metric
    if (sourceId) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await libsql.execute({
          sql: `INSERT INTO "SourceMetric" (id, sourceId, date, leads, conversions, conversionRate, cost, createdAt)
            VALUES (?, ?, ?, 1, 0, 0, 0, CURRENT_TIMESTAMP)
            ON CONFLICT(sourceId, date) DO UPDATE SET leads = leads + 1`,
          args: ['sm_' + sourceId + '_' + today, sourceId, today],
        });
      } catch (e) { console.warn('[leads] source metric failed:', e); }
    }

    // Create notification for admin
    try {
      const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: `INSERT INTO Notification (id, userId, type, title, message, link, createdAt)
          VALUES (?, ?, 'CONTACT', ?, ?, ?, CURRENT_TIMESTAMP)`,
        args: [notifId, adminId, `📩 Nuevo lead: ${nombre}`, `${email} | ${telefono} | ${segmento}`, '/admin/contactos'],
      });
    } catch (e) { console.warn('[leads] notification failed:', e); }

    // Update admin's totalContacts
    try {
      await libsql.execute({
        sql: `UPDATE "User" SET totalContacts = (SELECT COUNT(*) FROM Contact WHERE ownerId = ?), updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
        args: [adminId, adminId],
      });
    } catch (e) { console.warn('[leads] user metrics failed:', e); }

    // 2. Send notifications (don't block the response if they fail)
    const contactData = { nombre, email, telefono, segmento, cobertura, edad, mensaje };

    // Fire and forget - errors are logged but don't affect the user response
    Promise.all([
      sendNewContactEmail(contactData).catch((e) => console.error('[Leads] Email error:', e)),
      sendWhatsAppNotification(contactData).catch((e) => console.error('[Leads] WhatsApp error:', e)),
    ]).catch(() => {});

    return NextResponse.json({
      success: true,
      message: '¡Gracias por tu interés! Nos pondremos en contacto pronto.',
      id,
    }, { status: 201 });
  } catch (error) {
    console.error('[Leads API] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
