// Middleware — subdomain redirect + role-based route protection
// ──────────────────────────────────────────────────────────────────────
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Subdomain redirect ───
// cotiza.asesoradesalud.com.ar → /seguros (rewrite, not redirect)
function subdomainMiddleware(req: NextRequest): NextResponse | null {
  const host = req.headers.get('host') || '';
  const pathname = req.nextUrl.pathname;

  // If visiting cotiza subdomain at root, rewrite to /seguros
  if ((host === 'cotiza.asesoradesalud.com.ar' || host === 'www.cotiza.asesoradesalud.com.ar') && pathname === ') {
    return NextResponse.rewrite(new URL('/seguros', req.url));
  }

  return null;
}

// ─── Auth-based protection ───
const authMiddleware = withAuth(
  (req) => {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    const isApi = path.startsWith('/api/');

    // ─── ADMIN area ───
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (role !== 'ADMIN') {
        if (isApi) return NextResponse.json({ error: 'Forbidden: se requiere rol ADMIN' }, { status: 403 });
        const dest = role === 'VENDEDOR' ? '/vendedor' : '/login';
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.next();
    }

    // ─── VENDEDOR area ───
    if (path.startsWith('/vendedor') || path.startsWith('/api/vendedor')) {
      if (role !== 'VENDEDOR') {
        if (isApi) return NextResponse.json({ error: 'Forbidden: se requiere rol VENDEDOR' }, { status: 403 });
        const dest = role === 'ADMIN' ? '/admin' : '/login';
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// ─── Combined middleware ───
export default function middleware(req: NextRequest) {
  // 1. Check subdomain first (no auth needed)
  const subdomainResponse = subdomainMiddleware(req);
  if (subdomainResponse) return subdomainResponse;

  // 2. For protected routes, use auth middleware
  const path = req.nextUrl.pathname;
  if (
    path.startsWith('/admin') ||
    path.startsWith('/vendedor') ||
    path.startsWith('/api/admin') ||
    path.startsWith('/api/vendedor')
  ) {
    // @ts-expect-error - withAuth expects specific types
    return authMiddleware(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/vendedor/:path*',
    '/api/admin/:path*',
    '/api/vendedor/:path*',
  ],
};

