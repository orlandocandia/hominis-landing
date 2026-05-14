// GET /api/setup - One-time setup: verify Turso connection and create tables + admin user
// Accepts optional query params: turso_url and turso_token (as additional fallback)
import { NextResponse } from 'next/server';
import { getTursoUrl, getTursoAuthToken, isTursoConfigured, getLibsqlClient } from '@/lib/turso-config';

export async function GET(request: Request) {
  try {
    // Check for query parameter overrides (highest priority fallback)
    const { searchParams } = new URL(request.url);
    const queryTursoUrl = searchParams.get('turso_url') || '';
    const queryTursoToken = searchParams.get('turso_token') || '';

    // Resolve credentials: query params > env vars > hardcoded config
    const tursoUrl = queryTursoUrl.startsWith('libsql://') ? queryTursoUrl : getTursoUrl();
    const tursoToken = queryTursoToken || getTursoAuthToken();

    if (!tursoUrl.startsWith('libsql://')) {
      return NextResponse.json({
        error: 'Turso no está configurado',
        hint: 'Agregá tus credenciales de Turso en el archivo src/lib/turso-config.ts (HARDCODED_TURSO_URL y HARDCODED_TURSO_AUTH_TOKEN), o pasalas por URL: ?turso_url=libsql://...&turso_token=...',
        current_turso_url: tursoUrl || '(vacía)',
        env_TURSO_URL: process.env.TURSO_URL ? 'definida' : 'NO definida',
        env_TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'definida' : 'NO definida',
        hardcoded_config: isTursoConfigured() ? 'configurado' : 'NO configurado (vacío)',
        source: queryTursoUrl ? 'query_params' : (process.env.TURSO_URL ? 'env_vars' : 'hardcoded'),
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    const results: string[] = [];

    // Create Contacto table if not exists
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

    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_email_idx ON Contacto(email)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_segmento_idx ON Contacto(segmento)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_createdAt_idx ON Contacto(createdAt)`);
    await libsql.execute(`CREATE INDEX IF NOT EXISTS Contacto_estado_idx ON Contacto(estado)`);

    // Create User table if not exists
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

    await libsql.execute(`CREATE INDEX IF NOT EXISTS User_email_idx ON User(email)`);

    // Create admin user if not exists
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
      connection: {
        url_prefix: tursoUrl.substring(0, 30) + '...',
        source: queryTursoUrl ? 'query_params' : (process.env.TURSO_URL ? 'env_vars' : 'hardcoded_config'),
      },
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
