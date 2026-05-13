// POST /api/setup - Create initial admin user (only works once)
// This endpoint is for initial setup on Vercel where you can't run seed scripts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({ where: { rol: 'ADMIN' } });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Ya existe un usuario administrador. Usá el login normal.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, nombre } = body;

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son obligatorios' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Validate password (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        nombre,
        rol: 'ADMIN',
        activo: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario administrador creado correctamente',
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    console.error('[Setup API] Error:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario. Verificá que la base de datos esté configurada.' },
      { status: 500 }
    );
  }
}
