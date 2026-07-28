'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { COMPANIES, scrollToSection, type Company } from './companies'

function CompanyCard({ company }: { company: Company }) {
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
      className="group flex flex-col items-center justify-start gap-4 rounded-xl border-2 bg-card p-6 text-center transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      style={{ borderColor: company.color }}
      aria-label={`Ver sección de ${company.name}`}
    >
      <div className="flex items-center justify-center h-16 w-full">
        <Image
          src={company.logo}
          alt={`Logo de ${company.name}`}
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
          {company.description}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-foreground/70 group-hover:text-foreground transition">
        Ver más
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  )
}

export function CompaniesSection() {
  return (
    <section
      id="empresas"
      className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center scroll-mt-16"
      aria-labelledby="empresas-title"
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="empresas-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            Empresas que representamos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Elegí la empresa de tu interés para conocer más detalles.
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
