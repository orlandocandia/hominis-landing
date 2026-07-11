// CSRF Protection Utility
// Equivalent to PHP CSRF token management

import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function validateCsrfToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // Check length (hex encoded 32 bytes = 64 chars)
  if (token.length !== CSRF_TOKEN_LENGTH * 2) return false;
  
  // Check hex format
  if (!/^[a-f0-9]+$/i.test(token)) return false;
  
  return true;
}

export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

export async function setCsrfCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client for form submission
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' — strict blocks cookies on cross-site POSTs (Vercel)
    maxAge: CSRF_EXPIRY_MS / 1000,
    path: '/',
  });
}

export async function verifyCsrf(request: Request): Promise<boolean> {
  const headerToken = request.headers.get('x-csrf-token');
  const cookieToken = await getCsrfTokenFromCookie();
  
  if (!headerToken || !cookieToken) return false;
  if (!validateCsrfToken(headerToken) || !validateCsrfToken(cookieToken)) return false;
  
  // Constant-time comparison to prevent timing attacks
  try {
    const buf1 = Buffer.from(headerToken, 'hex');
    const buf2 = Buffer.from(cookieToken, 'hex');
    if (buf1.length !== buf2.length) return false;
    return crypto.timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}

export { CSRF_COOKIE_NAME };
