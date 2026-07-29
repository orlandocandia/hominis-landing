'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { scrollToSection } from './companies'

export function Hero() {
  return (
    <section
      id="top"
      className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative w-full max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold backdrop-blur mb-4">
          Asesoramiento en salud • Sin costo
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Encontrá el plan de salud que mejor se adapta a vos
        </h1>
        <p className="text-base md:text-xl text-blue-50 mb-6 max-w-2xl mx-auto">
          Con más de 10 años de experiencia en el sector salud, te ayudo a
          elegir la cobertura médica que realmente necesitás. Asesoría
          personalizada, sin costo y con la mejor atención.
        </p>
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-white text-blue-700 hover:bg-blue-50"
          >
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#contacto')
              }}
            >
              Asesorate
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 hover:text-white"
          >
            <a
              href="#empresas"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#empresas')
              }}
            >
              Ver empresas
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
