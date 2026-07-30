'use client'

import { useState, useEffect } from 'react'
import { PawPrint } from 'lucide-react'

export function AmarMascotasBenefit() {
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowImage(prev => !prev)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Verificar que la imagen existe (console log para debug)
  useEffect(() => {
    console.log('🔄 AmarMascotas - showImage:', showImage)
  }, [showImage])

  return (
    <div className="relative overflow-hidden rounded-lg">
      {showImage ? (
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/seguros/amar-mascotas.jpg"
            alt="Amar Mascotas - Veterinaria a domicilio"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Error al cargar la imagen:', e)
              e.currentTarget.src = '' // Limpiar src si hay error
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-medium">Amar Mascotas</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm min-h-[90px] justify-center">
          <div className="flex items-start gap-2">
            <PawPrint className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-foreground">Amar Mascotas</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 ml-7">
            Veterinaria a domicilio
          </span>
        </div>
      )}
    </div>
  )
}
