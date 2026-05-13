// GET /api/csrf - Generate and return CSRF token
import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie } from '@/lib/csrf';

export async function GET() {
  try {
    const token = generateCsrfToken();
    await setCsrfCookie(token);
    
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: 'Error generating CSRF token' },
      { status: 500 }
    );
  }
}
