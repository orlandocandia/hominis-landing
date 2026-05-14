// Turso Database Configuration
// ============================
// Centralized Turso credentials and client factory.
// All API routes and auth use this file to get database access.

// ─── CREDENTIAL RESOLVER ───
// Reads from env vars first, then falls back to hardcoded values
// (hardcoded values are needed for Vercel where env vars sometimes don't load)

function getTursoUrl(): string {
  return process.env.TURSO_URL || 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io';
}

function getTursoAuthToken(): string {
  // IMPORTANT: Replace the empty string below with your actual Turso auth token
  // before pushing to GitHub/Vercel
  return process.env.TURSO_AUTH_TOKEN || '';
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
