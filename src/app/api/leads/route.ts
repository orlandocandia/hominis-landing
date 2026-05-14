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

function getTursoClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');
  return createClient({
    url: process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
}

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

    // 1. Store in database
    const libsql = getTursoClient();
    const id = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await libsql.execute({
      sql: `INSERT INTO Contacto (id, nombre, email, telefono, segmento, mensaje, cobertura, edad, origen, ip, estado, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, nombre, email, telefono, segmento, mensaje || null, cobertura || null, edad || null, 'landing', clientIp, 'NUEVO', now, now],
    });

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
