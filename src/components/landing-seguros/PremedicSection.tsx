'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { COMPANIES } from './companies'

/**
 * Sección de Grupo Premedic — PLACEHOLDER.
 *
 * Por ahora solo muestra el logo + nombre + mensaje "Próximamente".
 * El contenido detallado se agregará en una etapa posterior.
 *
 * El `id="premedic"` es referenciado por:
 *  - La tarjeta en `CompaniesSection` (scroll automático)
 *  - El selector de empresa en el formulario de `Contact`
 */
export function PremedicSection() {
  const company = COMPANIES.find((c) => c.id === 'premedic')
  if (!company) return null

  return (
    <section
      id={company.id}
      className="w-full py-16 bg-cyan-50/30 dark:bg-cyan-950/10 scroll-mt-24"
      aria-labelledby="premedic-title"
    >
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Encabezado: logo + nombre */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center justify-center h-16 w-16 shrink-0 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-cyan-100 dark:border-cyan-900/30">
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
              id="premedic-title"
              className="text-2xl md:text-3xl font-bold text-foreground"
            >
              {company.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              El respaldo que te merecés
            </p>
          </div>
        </div>

        {/* Contenido placeholder — reemplazar en el futuro */}
        <div className="rounded-xl border-2 border-dashed border-cyan-200 dark:border-cyan-900/40 bg-card p-10 md:p-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Clock className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-lg font-semibold text-foreground">
            Próximamente, información detallada de Grupo Premedic
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
