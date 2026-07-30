'use client'

import { useState, useEffect, useRef } from 'react'
import { PawPrint } from 'lucide-react'

export function AmarMascotasBenefit() {
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowVideo(prev => !prev)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.play()
    }
  }, [showVideo])

  return (
    <div className="relative overflow-hidden rounded-lg h-[90px]">
      <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm" />

      <div className="relative w-full h-full">
        {/* Video */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 rounded-lg overflow-hidden ${
            showVideo ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <video
            ref={videoRef}
            src="/videos/amarmascota.mp4"
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        </div>

        {/* Cartelito */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-3 transition-opacity duration-700 ${
            showVideo ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-start gap-2">
            <PawPrint className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-foreground">Amar Mascotas</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 ml-7">
            Veterinaria a domicilio
          </span>
        </div>
      </div>
    </div>
  )
}
