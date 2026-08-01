'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
 * - Auto-reproducción cada 4 segundos
 * - Pausa al hacer hover (mouse encima)
 * - Flechas de navegación (< y >) a los lados
 * - Puntos indicadores abajo
 * - Transición suave entre imágenes
 * - Imágenes optimizadas con Next.js Image
 *
 * Ubicación: entre el texto gris "Una red médica..." y el botón "Ver Planes".
 */
export function DoctoRedCarrusel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = CARRUSEL_IMAGES.length

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [total])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  // Auto-reproducción cada 4s, con pausa en hover
  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(nextSlide, 4000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, nextSlide])

  return (
    <div
      className="my-3 md:my-4 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
        {/* Track de imágenes */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {CARRUSEL_IMAGES.map((src, index) => (
            <div
              key={index}
              className="min-w-full flex-shrink-0 flex justify-center items-center p-1 md:p-2"
            >
              <div className="relative w-full h-24 md:h-32 lg:h-36">
                <Image
                  src={src}
                  alt={`Logo de clínica ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 600px"
                  quality={80}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Imagen anterior"
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white px-2 py-1 rounded-r text-sm transition-colors z-10"
        >
          ❮
        </button>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Imagen siguiente"
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white px-2 py-1 rounded-l text-sm transition-colors z-10"
        >
          ❯
        </button>

        {/* Puntos indicadores */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 z-10">
          {CARRUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-400 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
