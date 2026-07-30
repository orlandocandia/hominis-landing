'use client'

import Image from 'next/image'
import { ArrowRight, CheckCircle2, Building2, Heart, MapPin } from 'lucide-react'
import { useTranslation } from './useTranslation'
import { AmarMascotasBenefit } from './AmarMascotasBenefit'
import { COMPANIES, scrollToSection, type Company } from './companies'

const COMPANY_KEYS: Record<string, { desc: string; slogan: string; benefit: string }> = {
  doctored: {
    desc: 'empresas.doctored.desc',
    slogan: 'empresas.doctored.slogan',
    benefit: 'empresas.doctored.benefit',
  },
  premedic: {
    desc: 'empresas.premedic.desc',
    slogan: 'empresas.premedic.slogan',
    benefit: 'empresas.premedic.benefit',
  },
}

const COMPANY_STYLES: Record<string, {
  bg: string
  border: string
  hoverBg: string
  hoverBorder: string
  text: string
}> = {
  doctored: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900/40',
    hoverBg: 'hover:bg-blue-100/50 dark:hover:bg-blue-950/40',
    hoverBorder: 'hover:border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
  },
  premedic: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-900/40',
    hoverBg: 'hover:bg-green-100/50 dark:hover:bg-green-950/40',
    hoverBorder: 'hover:border-green-500',
    text: 'text-green-600 dark:text-green-400',
  },
}

function CompanyCard({ company }: { company: Company }) {
  const { t } = useTranslation()
  const keys = COMPANY_KEYS[company.id] || COMPANY_KEYS.doctored
  const styles = COMPANY_STYLES[company.id] || COMPANY_STYLES.doctored
  const isPremedic = company.id === 'premedic'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
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
      className={`group relative flex min-h-[350px] md:min-h-[420px] lg:min-h-[50vh] xl:min-h-[45vh] w-full flex-col items-center justify-center gap-3 md:gap-4 rounded-2xl border-2 p-6 md:p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${styles.bg} ${styles.border} ${styles.hoverBg} ${styles.hoverBorder}`}
      aria-label={`${t('empresas.verPlanes')} ${company.name}`}
    >
      {/* ✅ LOGO (permanece en ambas) */}
      <div className="flex items-center justify-center h-20 md:h-28 w-full">
        <Image
          src={company.logo}
          alt={`${company.name}`}
          width={280}
          height={112}
          style={{ height: '4rem', width: 'auto' }}
          className="object-contain transition-transform duration-300 group-hover:scale-105 md:!h-24"
          priority
        />
      </div>

      {isPremedic ? (
        <>
          {/* 🆕 NUEVO TÍTULO para Premedic */}
          <h3 className="text-2xl md:text-3xl font-semibold text-[#1a6b3c] dark:text-green-400 text-center">
            Somos el respaldo que te merecés
          </h3>

          {/* 🆕 NUEVO SLOGAN para Premedic */}
          <p className="text-sm md:text-base text-[#4a9a6a] dark:text-green-300 text-center max-w-sm px-2 leading-relaxed">
            La mejor cobertura. Amplia red médica y centros propios para
            cuidarte a vos y a tu familia.
          </p>

          {/* 🆕 BENEFICIOS (grid 2x2) con iconos lucide */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
            <AmarMascotasBenefit />
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
              <div className="flex items-start gap-2">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground">Centros médicos propios</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
              <div className="flex items-start gap-2">
                <Heart className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground">El mejor de sus cuidados</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground">Presencia en 5 provincias</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Formato DoctoRed (se mantiene igual) */}
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground">
              {company.name}
            </h3>
            <p className="text-sm font-medium text-foreground/80 italic">
              {t(keys.slogan)}
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(keys.desc)}
          </p>

          <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 shadow-sm w-full ${styles.text}`}>
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
            <span className="text-xs font-semibold">
              {t(keys.benefit)}
            </span>
          </div>
        </>
      )}

      {/* ✅ BOTÓN "Ver Planes" (permanece en ambas) */}
      <span
        className={`mt-auto inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg font-semibold text-white transition-all duration-300 group-hover:shadow-lg group-hover:gap-3 ${styles.text === 'text-blue-600 dark:text-blue-400' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {t('empresas.verPlanes')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  )
}

export function CompaniesSection() {
  const { t } = useTranslation()

  return (
    <section
      id="empresas"
      className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center scroll-mt-16 bg-white dark:bg-background"
      aria-labelledby="empresas-title"
    >
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8 text-center">
          <h2
            id="empresas-title"
            className="text-2xl md:text-4xl font-bold text-foreground"
          >
            {t('empresas.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {t('empresas.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto pt-4 md:pt-8">
          {COMPANIES.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </section>
  )
}
