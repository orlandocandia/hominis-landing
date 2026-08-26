import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware — routing + auth protection.
 *
 * 1. Rewrite cotiza.asesoradesalud.com.ar → /seguros
 * 2. Protect /dashboard, /admin/*, /vendedor/* — redirect to /login if no session
 */
export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const hostname = host.split(':')[0].toLowerCase()

  // --- Subdominio cotiza → /seguros ---
  const isCotizaSubdomain =
    hostname === 'cotiza.asesoradesalud.com.ar' ||
    hostname === 'www.cotiza.asesoradesalud.com.ar' ||
    hostname.startsWith('cotiza.')

  if (isCotizaSubdomain && req.nextUrl.pathname !== '/seguros') {
    const url = req.nextUrl.clone()
    url.pathname = '/seguros'
    return NextResponse.rewrite(url)
  }

  // --- Auth protection for dashboard routes ---
  const { pathname } = req.nextUrl
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendedor')

  if (isProtectedRoute) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      // Redirect to login with callbackUrl
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
