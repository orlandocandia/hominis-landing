'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const images = [
  '/images/seguros/1.png',
  '/images/seguros/2.png',
  '/images/seguros/3.png',
  '/images/seguros/4.png',
  '/images/seguros/5.png',
  '/images/seguros/6.png',
  '/images/seguros/7.png',
  '/images/seguros/8.png',
  '/images/seguros/9.png',
  '/images/seguros/10.png',
  '/images/seguros/11.png',
  '/images/seguros/12.png',
  '/images/seguros/13.png',
  '/images/seguros/14.png',
]

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, 4000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused])

  return (
    <div className="mt-6">
      {/* TÍTULO Y TEXTO ANTES DEL CARRUSEL */}
      <div className="text-center mb-4">
        <h3 className="text-base md:text-lg font-bold text-foreground">
          Una red médica que te acompaña en todo el país.
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
          Contamos con una amplia red para que siempre tengas atención médica cerca de tu casa.
        </p>
      </div>

      {/* Carrusel con imágenes optimizadas */}
      <div
        className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg bg-gray-50 dark:bg-gray-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="min-w-full flex-shrink-0 flex justify-center items-center p-4">
              <div className="relative w-full aspect-[16/10] max-h-[300px] md:max-h-[400px]">
                <Image
                  src={src}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  quality={80}
                  priority={index === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Puntos indicadores */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === index ? 'bg-blue-600 w-4' : 'bg-gray-400 hover:bg-gray-600 w-1.5'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
