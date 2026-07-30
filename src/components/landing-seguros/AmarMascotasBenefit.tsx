'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Beneficio "Amar Mascotas" con loop automático:
 * alterna entre un cartelito (emoji + texto) y el video (si existe).
 * Si el video no existe o falla al cargar, se queda en el cartelito.
 */
export function AmarMascotasBenefit() {
  const [showVideo, setShowVideo] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoError) return
    const interval = setInterval(() => {
      setShowVideo((prev) => !prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [videoError])

  useEffect(() => {
    if (showVideo && videoRef.current && !videoError) {
      videoRef.current.play().catch(() => {
        setVideoError(true)
        setShowVideo(false)
      })
    }
  }, [showVideo, videoError])

  // Si el video falló, mostrar solo el cartelito permanentemente
  if (videoError || !showVideo) {
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white/50 dark:bg-black/20 rounded-lg min-h-[128px]">
        <span className="text-2xl" aria-hidden>🐾</span>
        <span className="text-xs font-medium text-foreground">Amar Mascotas</span>
        <span className="text-[10px] text-muted-foreground">Veterinaria a domicilio</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src="/videos/amarmascota.mp4"
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        onError={() => {
          setVideoError(true)
          setShowVideo(false)
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white text-xs font-medium">🐾 Amar Mascotas</p>
      </div>
    </div>
  )
}
