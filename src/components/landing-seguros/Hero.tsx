'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/provider'
import { scrollToSection } from './companies'

export function Hero() {
  const { t } = useI18n()

  return (
    <section
      id="top"
      className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white"
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
          {t('seguros.hero.badge')}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          {t('seguros.hero.title')}
        </h1>
        <p className="text-base md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
          {t('seguros.hero.subtitle')}
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
              {t('seguros.hero.cta')}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
