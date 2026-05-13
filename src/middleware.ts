// Middleware - Route Protection
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect these routes
  const isDashboard = pathname.startsWith('/dashboard');
  const isContactsApi = pathname.startsWith('/api/contacts');

  if (!isDashboard && !isContactsApi) {
    return NextResponse.next();
  }

  // Check for JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (isContactsApi) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/contacts/:path*',
  ],
};
