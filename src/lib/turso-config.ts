// Turso Database Configuration
// ============================
// This file provides Turso credentials from multiple sources:
// 1. Environment variables (preferred for security)
// 2. Hardcoded fallback values (for when Vercel env vars don't work)
//
// TO CONFIGURE: Update the HARDCODED values below with your Turso credentials,
// then push to GitHub. Vercel will redeploy automatically.
//
// Get your credentials from: https://turso.tech/app → Your Database → Settings

// ─── HARDCODED CREDENTIALS (FALLBACK) ───
// Update these with your actual Turso credentials
// These are used when environment variables are not available (e.g., Vercel misconfiguration)
const HARDCODED_TURSO_URL = '';
const HARDCODED_TURSO_AUTH_TOKEN = '';
const HARDCODED_NEXTAUTH_SECRET = 'hominis-agustina-candia-2025-secret-key-secure';

// ─── CREDENTIAL RESOLVER ───
// Reads from env vars first, then falls back to hardcoded values
export function getTursoUrl(): string {
  return process.env.TURSO_URL || HARDCODED_TURSO_URL || '';
}

export function getTursoAuthToken(): string {
  return process.env.TURSO_AUTH_TOKEN || HARDCODED_TURSO_AUTH_TOKEN || '';
}

export function getNextauthSecret(): string {
  return process.env.NEXTAUTH_SECRET || HARDCODED_NEXTAUTH_SECRET || '';
}

export function isTursoConfigured(): boolean {
  return getTursoUrl().startsWith('libsql://');
}

// Get a libsql client using resolved credentials
export function getLibsqlClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client');
  
  return createClient({
    url: getTursoUrl(),
    authToken: getTursoAuthToken(),
  });
}
