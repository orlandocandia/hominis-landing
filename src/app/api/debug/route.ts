// GET /api/debug - Diagnostic endpoint to troubleshoot environment variable issues
// Shows what env vars are available and whether Turso is properly configured
import { NextResponse } from 'next/server';
import { getTursoUrl, getTursoAuthToken, isTursoConfigured } from '@/lib/turso-config';

export async function GET() {
  // Collect environment variable keys (NOT values for security)
  const envKeys = Object.keys(process.env).sort();
  
  // Check specific variables (show only first/last chars of values for security)
  const maskValue = (val: string, showChars = 4) => {
    if (!val) return '(vacía)';
    if (val.length <= showChars * 2) return '***';
    return val.substring(0, showChars) + '...' + val.substring(val.length - showChars);
  };

  const diagnosis = {
    // Turso configuration status
    turso: {
      configured: isTursoConfigured(),
      resolved_url: maskValue(getTursoUrl(), 15),
      resolved_token: maskValue(getTursoAuthToken()),
      source: process.env.TURSO_URL ? 'env_var' : '(fallback to hardcoded)',
    },
    // Environment variable check
    env_vars: {
      TURSO_URL: process.env.TURSO_URL ? `definida (${maskValue(process.env.TURSO_URL, 15)})` : 'NO definida',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? `definida (${maskValue(process.env.TURSO_AUTH_TOKEN)})` : 'NO definida',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `definida` : 'NO definida',
      DATABASE_URL: process.env.DATABASE_URL ? `definida (${maskValue(process.env.DATABASE_URL, 10)})` : 'NO definida',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? `definida (${process.env.NEXTAUTH_URL})` : 'NO definida',
    },
    // Runtime info
    runtime: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
    },
    // All env var keys available
    all_env_keys: envKeys,
    // Total count
    total_env_vars: envKeys.length,
  };

  return NextResponse.json(diagnosis, { status: 200 });
}
