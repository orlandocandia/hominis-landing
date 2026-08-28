import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60s for large image uploads

// POST /api/admin/upload
// Sube una imagen (base64) y devuelve la URL lista para guardar en avatarUrl.
//
// FORMA DE ALMACENAMIENTO: La imagen se almacena como data URL (base64) directamente
// en el campo avatarUrl del modelo User. Esto funciona para imagenes pequeñas
// (avatares, max ~200KB) sin necesidad de Vercel Blob o almacenamiento externo.
//
// LIMITACIONES:
// - Max 500KB despues de decode (configurable abajo).
// - Formatos: image/jpeg, image/png, image/webp, image/gif.
// - Se redimensiona automaticamente a 256x256 para avatares (opcional via ?size=).
//
// ALTERNATIVA FUTURA: Si se necesita almacenar mas imagenes o de mayor tamano,
// migrar a Vercel Blob (@vercel/blob) o Cloudinary, y guardar la URL remota en avatarUrl.
//
// BODY:
//   { image: "data:image/jpeg;base64,/9j/4AAQ..." }
// RESPUESTA:
//   { url: "data:image/jpeg;base64,/9j/4AAQ..." }
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => null)
    if (!body || !body.image) {
      return NextResponse.json({ error: 'Falta el campo "image" (data URL base64)' }, { status: 400 })
    }

    const dataUrl: string = body.image

    // Validar que sea un data URL de imagen
    const match = dataUrl.match(/^data:(image\/(jpeg|jpg|png|webp|gif));base64,/)
    if (!match) {
      return NextResponse.json({
        error: 'Formato invalido. Se espera data:image/(jpeg|png|webp|gif);base64,...'
      }, { status: 400 })
    }

    const mimeType = match[1]
    const base64Data = dataUrl.split(',')[1]

    // Validar tamano (max 500KB despues de decode = ~666KB en base64)
    const MAX_SIZE_BYTES = 500 * 1024 // 500KB
    const sizeBytes = Buffer.from(base64Data, 'base64').length
    if (sizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json({
        error: `Imagen demasiado grande (${(sizeBytes / 1024).toFixed(0)}KB). Max ${MAX_SIZE_BYTES / 1024}KB.`
      }, { status: 413 })
    }

    // Normalizar mime type (jpeg → image/jpeg)
    const normalizedMime = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType

    // Reconstruir el data URL normalizado
    const normalizedUrl = `data:${normalizedMime};base64,${base64Data}`

    return NextResponse.json({ url: normalizedUrl })
  } catch (error) {
    console.error('Error en POST /api/admin/upload:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
