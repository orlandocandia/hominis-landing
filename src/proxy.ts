import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy — routing basado en dominio.
 *
 * Reescribe el subdominio `cotiza.asesoradesalud.com.ar` a `/seguros`.
 * El resto de las rutas pasan sin alteración.
 */
export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const hostname = host.split(':')[0].toLowerCase()

  const isCotizaSubdomain =
    hostname === 'cotiza.asesoradesalud.com.ar' ||
    hostname === 'www.cotiza.asesoradesalud.com.ar' ||
    hostname.startsWith('cotiza.')

  if (isCotizaSubdomain && req.nextUrl.pathname !== '/seguros') {
    const url = req.nextUrl.clone()
    url.pathname = '/seguros'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
