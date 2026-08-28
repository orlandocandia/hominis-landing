import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// POST /api/admin/geocode
// Geocodifica una dirección usando OpenStreetMap Nominatim (gratuito, sin API key).
//
// BODY:
//   { provincia: "Misiones", ciudad: "Posadas", direccion: "Av. Santa Fe 1234" }
// RESPUESTA:
//   { lat: -27.3664824, lng: -55.8942950, displayName: "Posadas, Misiones, Argentina" }
//   o { lat: null, lng: null, displayName: null, error: "No se encontró la dirección" }
//
// Nominatim tiene un rate limit de 1 request/segundo. No es apto para batches masivos,
// pero para geocodificar direcciones una a una (al crear/editar un vendedor o cliente) está OK.
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
    }

    const { provincia, ciudad, direccion } = body
    if (!provincia && !ciudad && !direccion) {
      return NextResponse.json({ error: 'Se requiere al menos provincia, ciudad o dirección' }, { status: 400 })
    }

    // Construir el query string para Nominatim
    // Formato: "direccion, ciudad, provincia, Argentina"
    const partes: string[] = []
    if (direccion) partes.push(direccion)
    if (ciudad) partes.push(ciudad)
    if (provincia) partes.push(provincia)
    partes.push('Argentina') // limitar a Argentina
    const query = partes.join(', ')

    // Llamar a Nominatim (con User-Agent obligatorio)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ar`
    const nominatimRes = await fetch(url, {
      headers: {
        'User-Agent': 'Hominis-CRM/1.0 (asesoradesalud.com.ar)',
        'Accept': 'application/json',
      },
    })

    if (!nominatimRes.ok) {
      return NextResponse.json({
        error: `Nominatim devolvió ${nominatimRes.status}`,
        lat: null, lng: null, displayName: null,
      }, { status: 502 })
    }

    const data = await nominatimRes.json()
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        lat: null, lng: null, displayName: null,
        error: 'No se encontró la dirección',
      }, { status: 404 })
    }

    const result = data[0]
    return NextResponse.json({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    })
  } catch (error) {
    console.error('Error en POST /api/admin/geocode:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
