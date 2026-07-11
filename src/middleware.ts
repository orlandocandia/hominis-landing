// Middleware — role-based route protection (Fase 1)
// ──────────────────────────────────────────────────────
// /admin/*          → ADMIN only
// /productor/*      → PRODUCTOR only
// /vendedor/*       → VENDEDOR or PRODUCTOR (productor = vendedor extendido)
// /api/admin/*      → ADMIN only (403 JSON if wrong role)
// /api/productor/*  → PRODUCTOR only (403 JSON if wrong role)
// /api/vendedor/*   → VENDEDOR or PRODUCTOR (403 JSON if wrong role)
// Unauthenticated → redirect to /login (by withAuth)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  (req) => {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    const isApi = path.startsWith('/api/');

    // ─── ADMIN area ───
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (role !== 'ADMIN') {
        if (isApi) return NextResponse.json({ error: 'Forbidden: se requiere rol ADMIN' }, { status: 403 });
        const dest = role === 'PRODUCTOR' ? '/productor' : role === 'VENDEDOR' ? '/vendedor' : '/login';
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.next();
    }

    // ─── PRODUCTOR area (extended vendor) ───
    if (path.startsWith('/productor') || path.startsWith('/api/productor')) {
      if (role !== 'PRODUCTOR') {
        if (isApi) return NextResponse.json({ error: 'Forbidden: se requiere rol PRODUCTOR' }, { status: 403 });
        const dest = role === 'ADMIN' ? '/admin' : role === 'VENDEDOR' ? '/vendedor' : '/login';
        return NextResponse.redirect(new URL(dest, req.url));
      }
      return NextResponse.next();
    }

    // ─── VENDEDOR area (productor also has access — extended vendor) ───
    if (path.startsWith('/vendedor') || path.startsWith('/api/vendedor')) {
      if (role !== 'VENDEDOR' && role !== 'PRODUCTOR') {
        if (isApi) return NextResponse.json({ error: 'Forbidden: se requiere rol VENDEDOR o PRODUCTOR' }, { status: 403 });
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
    '/admin/:path*',
    '/vendedor/:path*',
    '/productor/:path*',
    '/api/admin/:path*',
    '/api/vendedor/:path*',
    '/api/productor/:path*',
  ],
};
