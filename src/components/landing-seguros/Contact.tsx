'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Phone, Mail, Facebook, Instagram, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANIES } from './companies'

// Datos de contacto y redes sociales
const WHATSAPP_NUMBER = '5493810000000'
const WHATSAPP_DISPLAY = '+54 9 381 000-0000'
const EMAIL = 'info@asesoradesalud.com.ar'
const FACEBOOK_URL = 'https://facebook.com/tu-pagina'
const FACEBOOK_DISPLAY = '/tu-pagina'
const INSTAGRAM_URL = 'https://instagram.com/tu-perfil'
const INSTAGRAM_DISPLAY = '@tu-perfil'

interface ContactLink {
  href: string
  icon: typeof Phone
  iconColor: string
  bgClass: string
  hoverClass: string
  borderClass: string
  display: string
  external?: boolean
}

const CONTACT_LINKS: ContactLink[] = [
  {
    href: `tel:+${WHATSAPP_NUMBER}`,
    icon: Phone,
    iconColor: 'text-green-600',
    bgClass: 'bg-green-50',
    hoverClass: 'hover:bg-green-100',
    borderClass: 'border-green-200',
    display: WHATSAPP_DISPLAY,
  },
  {
    href: `mailto:${EMAIL}`,
    icon: Mail,
    iconColor: 'text-blue-600',
    bgClass: 'bg-blue-50',
    hoverClass: 'hover:bg-blue-100',
    borderClass: 'border-blue-200',
    display: EMAIL,
  },
  {
    href: FACEBOOK_URL,
    icon: Facebook,
    iconColor: 'text-[#1877F2]',
    bgClass: 'bg-blue-50',
    hoverClass: 'hover:bg-blue-100',
    borderClass: 'border-blue-200',
    display: FACEBOOK_DISPLAY,
    external: true,
  },
  {
    href: INSTAGRAM_URL,
    icon: Instagram,
    iconColor: 'text-[#E4405F]',
    bgClass: 'bg-pink-50',
    hoverClass: 'hover:bg-pink-100',
    borderClass: 'border-pink-200',
    display: INSTAGRAM_DISPLAY,
    external: true,
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
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="contacto-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            Contactanos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Completá el formulario y un asesor te contactará a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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

            {/* Texto legal debajo del botón */}
            <p className="text-xs text-muted-foreground text-center mt-2">
              Al enviar este formulario, aceptás que me comunique con vos para
              brindarte asesoramiento. Tus datos están protegidos.
            </p>
          </form>

          {/* Datos de contacto + Redes + QR */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground">
              Datos de contacto
            </h3>

            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition ${link.bgClass} ${link.hoverClass} ${link.borderClass}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${link.iconColor}`} aria-hidden />
                    <span className="text-sm font-medium text-foreground">
                      {link.display}
                    </span>
                  </a>
                )
              })}
            </div>

            {/* Código QR */}
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-sm font-medium text-foreground mb-3">
                Escaneá el código QR
              </p>
              <div className="inline-block bg-white p-3 rounded-xl border border-border shadow-sm">
                <Image
                  src="/images/qr-contacto.png"
                  alt="QR de contacto — WhatsApp"
                  width={128}
                  height={128}
                  className="w-32 h-32 object-contain"
                  style={{ width: '8rem', height: '8rem' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Accedé directamente a nuestros canales de contacto
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
