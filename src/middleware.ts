// Middleware - Route Protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect these routes
  const isDashboard = pathname.startsWith('/dashboard');
  const isContactsApi = pathname.startsWith('/api/contacts');

  if (!isDashboard && !isContactsApi) {
    return NextResponse.next();
  }

  // Check for NextAuth session token cookie
  const sessionToken =
    request.cookies.get('__Secure-next-auth.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value;

  if (!sessionToken) {
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
