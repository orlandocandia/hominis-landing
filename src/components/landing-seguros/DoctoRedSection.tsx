'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { COMPANIES } from './companies'

/**
 * Sección de DoctoRed — PLACEHOLDER.
 *
 * Por ahora solo muestra el logo + nombre + mensaje "Próximamente".
 * El contenido detallado (planes, beneficios, cartilla, etc.) se agregará
 * en una etapa posterior reemplazando el bloque interior de esta sección.
 *
 * El `id="doctored"` es referenciado por:
 *  - La tarjeta en `CompaniesSection` (scroll automático)
 *  - El selector de empresa en el formulario de `Contact`
 */
export function DoctoRedSection() {
  const company = COMPANIES.find((c) => c.id === 'doctored')
  if (!company) return null

  return (
    <section
      id={company.id}
      className="py-16 md:py-20 bg-blue-50/30 dark:bg-blue-950/10 scroll-mt-16"
      aria-labelledby="doctored-title"
    >
      <div className="container mx-auto px-4">
        {/* Encabezado: logo + nombre */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center h-16 w-16 shrink-0 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-blue-100 dark:border-blue-900/30">
            <Image
              src={company.logo}
              alt={`Logo de ${company.name}`}
              width={200}
              height={80}
              style={{ height: '3rem', width: 'auto' }}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2
              id="doctored-title"
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              {company.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Cobertura médica de calidad
            </p>
          </div>
        </div>

        {/* Contenido placeholder — reemplazar en el futuro */}
        <div className="rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900/40 bg-card p-10 md:p-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Próximamente, información detallada de DoctoRed
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Estamos trabajando para brindarte toda la información sobre planes,
            cobertura y beneficios. Mientras tanto, contactanos para una
            asesoría personalizada.
          </p>
        </div>
      </div>
    </section>
  )
}
