// No middleware - route protection handled client-side and server-side in each route
// Dashboard: redirects to /login if no session (useSession hook)
// API /api/contacts: returns 401 if no session (getServerSession check)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
