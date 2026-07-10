// Middleware — role-based route protection
// Protects /admin/*, /asesor/*, /api/admin/*, /api/asesor/*
// - Unauthenticated → redirected to /login (by withAuth signIn page)
// - Authenticated but wrong role → redirected to their own dashboard (pages)
//   or 403 JSON (API routes)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  (req) => {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;
    const isAdminArea = path.startsWith('/admin') || path.startsWith('/api/admin');
    const isAsesorArea = path.startsWith('/asesor') || path.startsWith('/api/asesor');

    // API routes: respond with 403 JSON instead of redirecting
    const isApi = path.startsWith('/api/');

    if (isAdminArea && role !== 'ADMIN') {
      if (isApi) {
        return NextResponse.json({ error: 'Forbidden: se requiere rol ADMIN' }, { status: 403 });
      }
      const dest = role === 'ASESOR' ? '/asesor/dashboard' : '/login';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (isAsesorArea && role !== 'ASESOR') {
      if (isApi) {
        return NextResponse.json({ error: 'Forbidden: se requiere rol ASESOR' }, { status: 403 });
      }
      const dest = role === 'ADMIN' ? '/admin/dashboard' : '/login';
      return NextResponse.redirect(new URL(dest, req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: '/login' },
    callbacks: {
      // Require a valid token to access any matched route.
      // If absent, withAuth redirects to /login.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/asesor/:path*', '/api/admin/:path*', '/api/asesor/:path*'],
};
