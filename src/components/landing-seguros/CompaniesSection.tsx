'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'
import { COMPANIES, scrollToSection, type Company } from './companies'

// Map de id de empresa → translation key para la descripción
const COMPANY_DESC_KEY: Record<string, string> = {
  doctored: 'seguros.empresas.doctored.desc',
  premedic: 'seguros.empresas.premedic.desc',
}

function CompanyCard({ company }: { company: Company }) {
  const { t } = useI18n()
  const descKey = COMPANY_DESC_KEY[company.id] || 'seguros.empresas.doctored.desc'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Si la sección de la empresa existe en la página, scrollear a ella.
    // Si no existe (ej. secciones ocultas temporalmente), ir al formulario
    // de contacto para que el usuario pueda pedir asesoramiento.
    const target = document.querySelector(`#${company.id}`)
    if (target) {
      scrollToSection(`#${company.id}`)
    } else {
      scrollToSection('#contacto')
    }
  }

  return (
    <a
      href={`#${company.id}`}
      onClick={handleClick}
      className="group flex flex-col items-center justify-start gap-4 rounded-xl border-2 bg-card p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      style={{ borderColor: company.color }}
      aria-label={`${t('seguros.empresas.verMas')} ${company.name}`}
    >
      <div className="flex items-center justify-center h-16 w-full">
        <Image
          src={company.logo}
          alt={`${company.name}`}
          width={200}
          height={80}
          style={{ height: '3.5rem', width: 'auto' }}
          className="object-contain"
          priority
        />
      </div>
      <div>
        <h3
          className="text-lg font-bold"
          style={{ color: company.color }}
        >
          {company.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(descKey)}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-foreground/70 group-hover:text-foreground transition">
        {t('seguros.empresas.verMas')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  )
}

export function CompaniesSection() {
  const { t } = useI18n()

  return (
    <section
      id="empresas"
      className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center scroll-mt-16 bg-white dark:bg-background"
      aria-labelledby="empresas-title"
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="empresas-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            {t('seguros.empresas.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('seguros.empresas.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {COMPANIES.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </section>
  )
}
