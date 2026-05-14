// GET /api/setup - Create tables and admin user in Turso
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tursoUrl = process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io';
    const tursoToken = process.env.TURSO_AUTH_TOKEN || '';

    if (!tursoUrl.startsWith('libsql://')) {
      return NextResponse.json({ error: 'Turso no configurado', turso_url: tursoUrl || '(vacía)' });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken });

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
    results.push('Tabla Contacto OK');

    await libsql.execute('CREATE INDEX IF NOT EXISTS Contacto_email_idx ON Contacto(email)');
    await libsql.execute('CREATE INDEX IF NOT EXISTS Contacto_segmento_idx ON Contacto(segmento)');
    await libsql.execute('CREATE INDEX IF NOT EXISTS Contacto_createdAt_idx ON Contacto(createdAt)');
    await libsql.execute('CREATE INDEX IF NOT EXISTS Contacto_estado_idx ON Contacto(estado)');

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
    results.push('Tabla User OK');

    await libsql.execute('CREATE INDEX IF NOT EXISTS User_email_idx ON User(email)');

    // Create admin user
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bcrypt = require('bcryptjs');
    const existing = await libsql.execute({
      sql: 'SELECT id FROM User WHERE rol = ? LIMIT 1',
      args: ['ADMIN'],
    });

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Hominis2025!', 12);
      const id = 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
      const now = new Date().toISOString();
      await libsql.execute({
        sql: 'INSERT INTO User (id, email, password, nombre, rol, activo, intentosLogin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [id, 'acandia@mphominis.com.ar', hashedPassword, 'Agustina C. Candia', 'ADMIN', 1, 0, now, now],
      });
      results.push('Usuario admin creado');
    } else {
      results.push('Usuario admin ya existe');
    }

    return NextResponse.json({
      success: true,
      message: 'Setup completado exitosamente',
      details: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error en setup: ' + message }, { status: 500 });
  }
}
