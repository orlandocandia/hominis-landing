// POST /api/auth/reset-password — restablecer contraseña con token
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { hash } from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/zod';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    const libsql = getTursoClient();

    // Verificar token (válido, no expirado, no usado)
    const tokenResult = await libsql.execute({
      sql: `SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expiresAt > datetime('now')`,
      args: [token],
    });

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const resetToken = tokenResult.rows[0] as Record<string, unknown>;
    const email = resetToken.email as string;

    // Hash de la nueva contraseña (bcrypt cost 12)
    const passwordHash = await hash(password, 12);

    // Actualizar contraseña del usuario
    await libsql.execute({
      sql: 'UPDATE "User" SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?',
      args: [passwordHash, email],
    });

    // Marcar token como usado (token de un solo uso)
    await libsql.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
      args: [token],
    });

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (e: unknown) {
    console.error('[reset-password] error:', e);
    return NextResponse.json(
      { error: 'Error al restablecer la contraseña' },
      { status: 500 }
    );
  }
}
