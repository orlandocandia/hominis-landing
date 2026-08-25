'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export function MejorCuidadosBenefit() {
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowImage(prev => !prev)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg h-[90px]">
      <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm" />

      <div className="relative w-full h-full">
        <div
          className={`absolute inset-0 transition-opacity duration-700 rounded-lg overflow-hidden ${
            showImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/seguros/mejorcuidados.webp"
            alt="El mejor de sus cuidados"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-3 transition-opacity duration-700 ${
            showImage ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-start gap-2">
            <Heart className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-foreground">El mejor de sus cuidados</span>
          </div>
        </div>
      </div>
    </div>
  )
}
