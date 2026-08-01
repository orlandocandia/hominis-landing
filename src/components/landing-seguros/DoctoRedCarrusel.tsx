'use client'

import Image from 'next/image'

/**
 * Lista de imágenes del carrusel de DoctoRed.
 * Están en /public/images/seguros/carrusel/ (logo-1.png ... logo-18.png).
 */
const CARRUSEL_IMAGES = Array.from({ length: 18 }, (_, i) => `/images/seguros/carrusel/logo-${i + 1}.png`)

/**
 * Carrusel de imágenes para el cartel de DoctoRed.
 *
 * Features:
 * - Muestra 3 logos visibles al mismo tiempo
 * - Loop continuo e infinito (movimiento suave tipo "marquee" vía CSS animation)
 * - Pausa al hacer hover (mouse encima)
 * - SIN flechas de navegación
 * - SIN puntos indicadores
 * - Más bajo (no desplaza los carteles)
 * - Imágenes optimizadas con Next.js Image
 *
 * Ubicación: entre el texto gris "Una red médica..." y el botón "Ver Planes".
 *
 * Implementación: se duplica la lista de imágenes (original + copia) y se
 * anima con translateX de 0% a -50% en un loop infinito de 48s (lento).
 * Como el track contiene 2 copias idénticas, cuando llega al -50% (fin de la
 * primera copia) el reinicio es invisible porque la segunda copia es idéntica.
 * Los keyframes están definidos en globals.css (.doctored-carrusel-track).
 */
export function DoctoRedCarrusel() {
  // Duplicar las imágenes para crear un loop infinito sin saltos visibles.
  const displayImages = [...CARRUSEL_IMAGES, ...CARRUSEL_IMAGES]

  return (
    <div className="my-2 md:my-3 w-full">
      <div className="relative w-full overflow-hidden">
        {/* Track de imágenes - animación CSS marquee infinita (pausa en hover vía CSS) */}
        <div className="flex doctored-carrusel-track">
          {displayImages.map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex justify-center items-center p-2"
              style={{ width: '33.3333%' }}
            >
              <div className="relative w-full h-12 md:h-16 lg:h-20">
                <Image
                  src={src}
                  alt={`Logo de clínica ${(index % CARRUSEL_IMAGES.length) + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 33vw, 200px"
                  quality={85}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
