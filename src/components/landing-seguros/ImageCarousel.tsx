'use client'

import { useState, useEffect, useRef } from 'react'

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
      {/* 🔑 TÍTULO Y TEXTO ANTES DEL CARRUSEL */}
      <div className="text-center mb-4">
        <h3 className="text-base md:text-lg font-bold text-foreground">
          Una red médica que te acompaña en todo el país.
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
          Contamos con una amplia red para que siempre tengas atención médica cerca de tu casa.
        </p>
      </div>

      {/* Carrusel */}
      <div
        className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="min-w-full flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 md:h-48 object-cover"
              />
            </div>
          ))}
        </div>

        {/* Puntos indicadores */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80 w-1.5'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
