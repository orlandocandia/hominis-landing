'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANIES } from './companies'

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Teléfono / WhatsApp',
    value: '+54 9 381 000-0000',
    href: 'https://wa.me/5493810000000',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@asesoradesalud.com.ar',
    href: 'mailto:info@asesoradesalud.com.ar',
  },
  {
    icon: MapPin,
    label: 'Ubicación',
    value: 'San Miguel de Tucumán, Tucumán, Argentina',
    href: null,
  },
]

export function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Placeholder: en producción esto haría POST a /api/leads con el empresaId
    setSubmitted(true)
    e.currentTarget.reset()
    // Reset el estado de "enviado" después de 5s para permitir nuevos envíos
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section
      id="contacto"
      className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center scroll-mt-16 bg-white dark:bg-background"
      aria-labelledby="contacto-title"
    >
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="contacto-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            Contactanos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Completá el formulario y un asesor de Hominis te contactará a la
            brevedad, sin costo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Info de contacto */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 min-w-0">
            <h3 className="text-lg font-bold text-foreground">
              Datos de contacto
            </h3>
            <p className="text-sm text-muted-foreground">
              También podés contactarnos directamente por estos medios:
            </p>
            <ul className="mt-2 space-y-4">
              {CONTACT_INFO.map((info) => {
                const Icon = info.icon
                const content = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {info.label}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {info.value}
                      </span>
                    </span>
                  </>
                )
                return (
                  <li key={info.label}>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={info.href.startsWith('http') ? '_blank' : undefined}
                        rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-3 rounded-md p-1 hover:bg-accent transition"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-1">{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 min-w-0"
            aria-label="Formulario de contacto"
          >
            <h3 className="text-lg font-bold text-foreground">
              Solicitar asesoramiento
            </h3>

            {submitted && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                ¡Gracias! Tu solicitud fue enviada. Te contactaremos a la
                brevedad.
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nombre" className="text-sm font-medium text-foreground">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  required
                  type="text"
                  placeholder="Tu nombre"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="telefono" className="text-sm font-medium text-foreground">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  required
                  type="tel"
                  placeholder="+54 9 ..."
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                required
                type="email"
                placeholder="tu@email.com"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="empresa" className="text-sm font-medium text-foreground">
                Empresa de interés <span className="text-red-500">*</span>
              </label>
              <select
                id="empresa"
                name="empresa"
                required
                defaultValue=""
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Seleccioná una empresa
                </option>
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="ambas">Ambas / No estoy seguro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mensaje" className="text-sm font-medium text-foreground">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={4}
                placeholder="Contanos qué necesitás (opcional)"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              <Send className="mr-2 h-4 w-4" />
              Enviar solicitud
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
