// Middleware - Route Protection
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ token, req }) {
      const { pathname } = req.nextUrl;

      // Protect dashboard and its sub-routes
      if (pathname.startsWith('/dashboard')) {
        return !!token; // Must be authenticated
      }

      // Protect contacts API
      if (pathname.startsWith('/api/contacts')) {
        return !!token;
      }

      return true;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/contacts/:path*',
  ],
};
