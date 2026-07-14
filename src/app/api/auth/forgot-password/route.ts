// POST /api/auth/forgot-password — solicitar recuperación de contraseña
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/lib/zod';
import { Resend } from 'resend';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Hardcoded fallback (same as notifications/email.ts)
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6X6QSSxh_5nm4YVZUw21fJqPvjQ1vdpoG';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Email inválido' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Rate limiting: 3 solicitudes por hora por IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, { maxRequests: 3, windowMs: 60 * 60 * 1000 });

    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Esperá ${minutes} minutos.` },
        { status: 429 }
      );
    }

    const libsql = getTursoClient();

    // Verificar que el usuario existe (pero no revelar si no existe)
    const userResult = await libsql.execute({
      sql: 'SELECT id, email FROM "User" WHERE email = ? AND activo = 1',
      args: [email.toLowerCase()],
    });

    // Siempre devolver éxito (no revelar si el email existe)
    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un link de recuperación.',
      });
    }

    // Generar token seguro (32 bytes)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora
    const tokenId = 'pwt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // Guardar token en DB
    await libsql.execute({
      sql: `INSERT INTO password_reset_tokens (id, email, token, expiresAt, used, createdAt)
        VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      args: [tokenId, email.toLowerCase(), token, expiresAt],
    });

    // Enviar email
    const resetLink = `https://asesoradesalud.com.ar/reset-password?token=${token}`;
    const resend = new Resend(RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: 'Hominis CRM <onboarding@resend.dev>',
        to: email,
        subject: '🔐 Recuperación de contraseña - Hominis CRM',
        html: `
          <h1>Recuperación de contraseña</h1>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p><a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2E86AB; color: white; text-decoration: none; border-radius: 8px;">Restablecer contraseña</a></p>
          <p>Este link expira en <strong>1 hora</strong>.</p>
          <p>Si no solicitaste este cambio, ignorá este mensaje.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Hominis CRM - Sistema de gestión de salud</p>
        `,
      });
    } catch (emailError) {
      console.error('[forgot-password] Error enviando email:', emailError);
      // No revelar el error al usuario
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un link de recuperación.',
    });
  } catch (e: unknown) {
    console.error('[forgot-password] error:', e);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
