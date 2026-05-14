// POST /api/leads - Create a new lead (Contacto)
// Equivalent to ContactoController::store() in PHP MVC
// Uses Prisma first, falls back to raw SQL if Prisma fails (e.g., on Vercel without proper DB)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyCsrf } from '@/lib/csrf';
import { isTursoConfigured, getLibsqlClient } from '@/lib/turso-config';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  validateSegmento,
  validateCobertura,
  validateAge,
} from '@/lib/sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. CSRF Protection
    const csrfValid = await verifyCsrf(request);
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'Token de seguridad inválido. Recargá la página e intentá de nuevo.' },
        { status: 403 }
      );
    }

    // 2. Rate Limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Por favor, esperá unos minutos.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    
    const nombre = sanitizeString(body.nombre);
    const email = sanitizeEmail(body.email);
    const telefono = sanitizePhone(body.telefono);
    const segmento = validateSegmento(body.segmento);
    const mensaje = sanitizeString(body.mensaje);
    const cobertura = validateCobertura(body.cobertura);
    const edad = validateAge(body.edad);

    // 4. Validate required fields
    const errors: string[] = [];
    
    if (!nombre || nombre.length < 2) {
      errors.push('El nombre es obligatorio (mínimo 2 caracteres)');
    }
    if (!email) {
      errors.push('El email no es válido');
    }
    if (!telefono || telefono.length < 6) {
      errors.push('El teléfono es obligatorio');
    }
    if (!segmento) {
      errors.push('Seleccioná un segmento válido');
    }
    if (edad === null && body.edad !== undefined && body.edad !== '') {
      errors.push('La edad ingresada no es válida');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join('. ') },
        { status: 400 }
      );
    }

    // 5. Insert into database
    // Try Prisma first, then fall back to raw SQL via Turso
    let contactoId: string;

    try {
      const contacto = await db.contacto.create({
        data: {
          nombre,
          email,
          telefono,
          segmento,
          mensaje: mensaje || null,
          cobertura: cobertura || null,
          edad,
          origen: 'landing',
          ip: clientIp,
          estado: 'NUEVO',
        },
      });
      contactoId = contacto.id;
    } catch (prismaError) {
      console.warn('[Leads API] Prisma failed, trying raw SQL fallback:', prismaError);
      
      // Fallback: use raw SQL via Turso libsql client
      if (!isTursoConfigured()) {
        throw prismaError; // No fallback available, re-throw original error
      }

      const libsql = getLibsqlClient();
      contactoId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const now = new Date().toISOString();

      await libsql.execute({
        sql: `INSERT INTO Contacto (id, nombre, email, telefono, segmento, mensaje, cobertura, edad, origen, ip, estado, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          contactoId,
          nombre,
          email,
          telefono,
          segmento,
          mensaje || null,
          cobertura || null,
          edad || null,
          'landing',
          clientIp,
          'NUEVO',
          now,
          now,
        ],
      });
    }

    // 6. Return success
    return NextResponse.json(
      {
        success: true,
        message: '¡Gracias por tu interés! Nos pondremos en contacto pronto.',
        id: contactoId,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[Leads API] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor. Intentá nuevamente.' },
      { status: 500 }
    );
  }
}
