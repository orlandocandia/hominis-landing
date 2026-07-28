'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { scrollToSection } from './companies'

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 text-white"
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
      <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
        <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold backdrop-blur mb-4">
          Asesoramiento en salud • Sin costo
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
          Encontrá el plan de salud que mejor se adapta a vos
        </h1>
        <p className="mt-4 text-base md:text-lg text-blue-50 max-w-2xl mx-auto">
          Compará las mejores opciones con asesoría personalizada y sin costo
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault()
                scrollToSection('#contacto')
              }}
            >
              Solicitar Asesoramiento
              <ArrowRight className="ml-2 h-4 w-4" />
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
