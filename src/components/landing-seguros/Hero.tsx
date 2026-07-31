'use client'

import { ArrowRight } from 'lucide-react'
import { useTranslation } from './useTranslation'

export function Hero() {
  const { t } = useTranslation()

  const scrollToContact = () => {
    const element = document.getElementById('contacto')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="top"
      className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-background dark:to-blue-950/10"
    >
      <div className="container mx-auto px-4 max-w-[650px] text-center pt-28 md:pt-32 pb-28 md:pb-32">
        {/* Título */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0F172A] dark:text-white leading-[110%] tracking-[-1.5px] mb-6">
          {t('hero.title')}
        </h1>

        {/* Descripción */}
        <p className="text-lg md:text-xl text-[#475569] dark:text-gray-300 leading-[165%] max-w-[650px] mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Botón */}
        <button
          onClick={scrollToContact}
          className="mt-10 inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-lg px-8 py-4 rounded-[14px] transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          {t('hero.cta')} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}
