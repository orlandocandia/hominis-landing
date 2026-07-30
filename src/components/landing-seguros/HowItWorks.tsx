'use client'

import Image from 'next/image'
import { Building2, FileText, PhoneCall } from 'lucide-react'
import { useTranslation } from './useTranslation'

export function HowItWorks() {
  const { t } = useTranslation()

  const STEPS = [
    {
      icon: Building2,
      step: 1,
      image: '/images/seguros/paso1-empresas.png',
      title: t('comoFunciona.step1.title'),
      description: t('comoFunciona.step1.desc'),
    },
    {
      icon: FileText,
      step: 2,
      image: '/images/seguros/paso2-formulario.png',
      title: t('comoFunciona.step2.title'),
      description: t('comoFunciona.step2.desc'),
    },
    {
      icon: PhoneCall,
      step: 3,
      image: '/images/seguros/paso3-contacto.png',
      title: t('comoFunciona.step3.title'),
      description: t('comoFunciona.step3.desc'),
    },
  ]

  return (
    <section
      id="como-funciona"
      className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center scroll-mt-16 bg-muted/30"
      aria-labelledby="como-funciona-title"
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="como-funciona-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            {t('comoFunciona.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('comoFunciona.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <div
              key={step.step}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {/* Imagen del paso con gradiente + badge */}
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradiente oscuro en la parte inferior */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                />
                {/* Icono decorativo top-right */}
                <div className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>
                {/* Badge "Paso N" bottom-left */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block text-white font-semibold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {t('comoFunciona.paso')} {step.step}
                  </span>
                </div>
              </div>

              {/* Contenido textual debajo de la imagen */}
              <div className="p-6">
                <h3 className="text-base font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Conector entre pasos (solo desktop) */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center"
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
