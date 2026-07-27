// Middleware — role-based route protection
// ──────────────────────────────────────────────────────────────────────
// /admin/*          → ADMIN only
// /vendedor/*       → VENDEDOR only
// /api/admin/*      → ADMIN only (403 JSON if wrong role)
// /api/vendedor/*   → VENDEDOR only (403 JSON if wrong role)
// Unauthenticated → redirect to /login (by withAuth)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Subdomain redirect: cotiza.asesoradesalud.com.ar → /seguros
function handleSubdomain(req: Request): NextResponse | null {
  const url = new URL(req.url);
  const host = url.hostname;

  if (host === 'cotiza.asesoradesalud.com.ar' && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/seguros', req.url));
  }

  return null;
}

export default withAuth(
  (req) => {
    // Subdomain redirect (runs before auth check)
    const subdomainRedirect = handleSubdomain(req);
    if (subdomainRedirect) return subdomainRedirect;

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

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/vendedor/:path*',
    '/api/admin/:path*',
    '/api/vendedor/:path*',
  ],
};

