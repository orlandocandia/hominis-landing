// GET /api/setup - One-time setup: creates tables and admin user on Turso
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL || '';
    const authToken = process.env.DATABASE_AUTH_TOKEN || '';

    if (!databaseUrl.startsWith('libsql://')) {
      return NextResponse.json(
        { error: 'Este endpoint solo funciona en producción con Turso. DATABASE_URL debe comenzar con libsql://' },
        { status: 400 }
      );
    }

    // Dynamically import libsql client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bcrypt = require('bcryptjs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client');

    const libsql = createClient({
      url: databaseUrl,
      authToken: authToken,
    });

    const results: string[] = [];

    // Create Contacto table
    await libsql.execute(`
      CREATE TABLE IF NOT EXISTS Contacto (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT NOT NULL,
        segmento TEXT NOT NULL,
        mensaje TEXT,
        cobertura TEXT,
        edad INTEGER,
        origen TEXT NOT NULL DEFAULT 'landing',
        ip TEXT,
        estado TEXT NOT NULL DEFAULT 'NUEVO',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push('✅ Tabla Contacto creada');

    // Create indexes for Contacto
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_email_idx ON Contacto(email)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_segmento_idx ON Contacto(segmento)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_createdAt_idx ON Contacto(createdAt)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_estado_idx ON Contacto(estado)`);
    results.push('✅ Índices de Contacto creados');

    // Create User table
    await libsql.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'ADMIN',
        activo INTEGER NOT NULL DEFAULT 1,
        ultimoLogin DATETIME,
        intentosLogin INTEGER NOT NULL DEFAULT 0,
        bloqueadoHasta DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push('✅ Tabla User creada');

    // Create index for User
    await libsql.execute(`CREATE INDEX IF NOT EXISTS User_email_idx ON User(email)`);
    results.push('✅ Índices de User creados');

    // Create admin user if not exists
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const adapter = new PrismaLibSql(libsql);
    const prisma = new PrismaClient({ adapter });

    const existingAdmin = await prisma.user.findFirst({ where: { rol: 'ADMIN' } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Hominis2025!', 12);
      await prisma.user.create({
        data: {
          email: 'acandia@mphominis.com.ar',
          password: hashedPassword,
          nombre: 'Agustina C. Candia',
          rol: 'ADMIN',
          activo: true,
        },
      });
      results.push('✅ Usuario admin creado (acandia@mphominis.com.ar / Hominis2025!)');
    } else {
      results.push('ℹ️ Usuario admin ya existe, no se creó otro');
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Setup completado exitosamente',
      details: results,
    });
  } catch (error: unknown) {
    console.error('[Setup API] Error:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error en setup: ' + message },
      { status: 500 }
    );
  }
}
