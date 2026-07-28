'use client'

import { MousePointerClick, FileText, PhoneCall } from 'lucide-react'

const STEPS = [
  {
    icon: MousePointerClick,
    step: 1,
    title: 'Elegí la empresa de tu interés',
    description:
      'Navegá las empresas que representamos y seleccioná la que más se adapte a tus necesidades.',
  },
  {
    icon: FileText,
    step: 2,
    title: 'Completá el formulario',
    description:
      'Dejanos tus datos y contanos qué estás buscando. Tomá un minuto, sin compromiso.',
  },
  {
    icon: PhoneCall,
    step: 3,
    title: 'Te contactamos para asesorarte',
    description:
      'Un asesor de Hominis te llamará para ayudarte a elegir el plan ideal, sin costo.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="py-16 md:py-20 scroll-mt-16"
      aria-labelledby="como-funciona-title"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2
            id="como-funciona-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            ¿Cómo funciona?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tres pasos simples para encontrar tu plan de salud ideal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <div
              key={step.step}
              className="relative rounded-xl border border-border bg-card p-6 text-center"
            >
              {/* Conector entre pasos (solo desktop) */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center"
                >
                  →
                </div>
              )}

              {/* Número de paso */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>

              <span className="inline-block rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-3">
                Paso {step.step}
              </span>

              <h3 className="text-base font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
