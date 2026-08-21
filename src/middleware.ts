import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de la landing de seguros.
 *
 * Reescribe a la ruta `/seguros` (donde esta el formulario de contacto
 * que envia emails a asesoradesalud.info@gmail.com) los siguientes hosts:
 *
 *   - cotiza.asesoradesalud.com.ar  (subdominio de seguros)
 *   - www.cotiza.asesoradesalud.com.ar
 *   - asesoradesalud.com.ar         (dominio apex)
 *   - www.asesoradesalud.com.ar      (www del dominio apex)
 *
 * El dominio apex y su www apuntan a /seguros porque en page.tsx (raiz)
 * vive el dashboard CRM, que NO tiene formulario de contacto. Reescribir
 * (en vez de redirigir 301) mantiene la URL limpia en el navegador del
 * usuario y evita una segunda peticion.
 *
 * El resto de las rutas pasan sin alteracion.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  // Normalizar: quitar puerto si lo hubiera
  const hostname = host.split(':')[0].toLowerCase()

  const shouldShowLanding =
    hostname === 'cotiza.asesoradesalud.com.ar' ||
    hostname === 'www.cotiza.asesoradesalud.com.ar' ||
    hostname.startsWith('cotiza.') ||
    hostname === 'asesoradesalud.com.ar' ||
    hostname === 'www.asesoradesalud.com.ar'

  if (shouldShowLanding && req.nextUrl.pathname !== '/seguros') {
    const url = req.nextUrl.clone()
    url.pathname = '/seguros'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
