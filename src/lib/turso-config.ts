// Turso Database Configuration
// ============================
// Centralized Turso credentials and client factory.
// All API routes and auth use this file to get database access.

// ─── CREDENTIAL RESOLVER ───
// Reads from env vars first, then falls back to hardcoded values
// (hardcoded values are needed for Vercel where env vars sometimes don't load)

export function getTursoUrl(): string {
  return process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io';
}

export function getTursoAuthToken(): string {
  // Hardcoded fallback for Vercel (env vars sometimes don't load there)
  return process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg3NjM4OTEsImlkIjoiMDE5ZTIzNDYtYjUwMS03Y2Y1LWFkZmItYWJjMDJmODNjNjQ4IiwicmlkIjoiMjI3M2MxOTAtYTA1Yy00MzA3LTk0ZTUtZWIxZTc1YmU3YmM4In0.oimDH6aXYryNto2cw5V3N9C2fhEPZH0jQwBp15VyGPciD7RzuIQfghQbnkuhoywlnFoz9rVq0YmFFXaM9OYfBQ';
}

export function getNextauthSecret(): string {
  return process.env.NEXTAUTH_SECRET || 'hominis-agustina-candia-2025-secret-key-secure';
}

export function isTursoConfigured(): boolean {
  return getTursoUrl().startsWith('libsql://') && getTursoAuthToken().length > 0;
}

// Get a libsql client using resolved credentials
// This is the ONLY way to get a Turso client - all routes must use this
export function getTursoClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');

  const url = getTursoUrl();
  const authToken = getTursoAuthToken();

  if (!authToken) {
    console.warn('[Turso] AUTH TOKEN no configurado - la conexión va a fallar');
  }

  return createClient({
    url,
    authToken,
  });
}
