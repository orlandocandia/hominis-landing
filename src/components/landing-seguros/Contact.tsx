'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Phone, Mail, Facebook, Instagram, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from './useTranslation'
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

export function Contact() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Links de contacto con dark: variants para modo oscuro
  const CONTACT_LINKS: ContactLink[] = [
    {
      href: `tel:+${WHATSAPP_NUMBER}`,
      icon: Phone,
      iconColor: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      hoverClass: 'hover:bg-green-100 dark:hover:bg-green-950/50',
      borderClass: 'border-green-200 dark:border-green-900/50',
      display: WHATSAPP_DISPLAY,
    },
    {
      href: `mailto:${EMAIL}`,
      icon: Mail,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      hoverClass: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
      borderClass: 'border-blue-200 dark:border-blue-900/50',
      display: EMAIL,
    },
    {
      href: FACEBOOK_URL,
      icon: Facebook,
      iconColor: 'text-[#1877F2] dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
      hoverClass: 'hover:bg-blue-100 dark:hover:bg-blue-950/50',
      borderClass: 'border-blue-200 dark:border-blue-900/50',
      display: FACEBOOK_DISPLAY,
      external: true,
    },
    {
      href: INSTAGRAM_URL,
      icon: Instagram,
      iconColor: 'text-[#E4405F] dark:text-pink-400',
      bgClass: 'bg-pink-50 dark:bg-pink-950/30',
      hoverClass: 'hover:bg-pink-100 dark:hover:bg-pink-950/50',
      borderClass: 'border-pink-200 dark:border-pink-900/50',
      display: INSTAGRAM_DISPLAY,
      external: true,
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      nombre: String(formData.get('nombre') || ''),
      telefono: String(formData.get('telefono') || ''),
      email: String(formData.get('email') || ''),
      empresa: String(formData.get('empresa') || ''),
      mensaje: String(formData.get('mensaje') || ''),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          (res.status === 400
            ? 'Faltan campos requeridos'
            : 'No se pudo enviar el mensaje. Intentá de nuevo.')
        throw new Error(msg)
      }

      // Exito: mostrar confirmacion y limpiar el form
      setSubmitted(true)
      form.reset()
      setTimeout(() => setSubmitted(false), 6000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al enviar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="contacto"
      className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center scroll-mt-16 bg-white dark:bg-background"
      aria-labelledby="contacto-title"
    >
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h2
            id="contacto-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            {t('contacto.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            {t('contacto.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-xl border border-border bg-card overflow-hidden min-w-0"
            aria-label={t('contacto.formTitle')}
          >
            {/* Título con fondo de color */}
            <div className="bg-primary/10 p-4 border-b border-primary/20">
              <h3 className="text-lg font-bold text-foreground text-center">
                {t('contacto.formTitle')}
              </h3>
            </div>

            {/* Contenido del formulario */}
            <div className="p-6 flex flex-col gap-4">
              {submitted && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {t('contacto.success')}
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300"
                >
                  <span className="shrink-0 font-bold">!</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium text-foreground">
                    {t('contacto.nombre')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    required
                    type="text"
                    placeholder={t('contacto.nombre')}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="telefono" className="text-sm font-medium text-foreground">
                    {t('contacto.telefono')} <span className="text-red-500">*</span>
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
                  {t('contacto.email')} <span className="text-red-500">*</span>
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
                  {t('contacto.empresa')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="empresa"
                  name="empresa"
                  required
                  defaultValue=""
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    {t('contacto.empresaPlaceholder')}
                  </option>
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="ambas">{t('contacto.empresaAmbas')}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="mensaje" className="text-sm font-medium text-foreground">
                  {t('contacto.mensaje')}
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  placeholder={t('contacto.mensajePlaceholder')}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className={`mr-2 h-4 w-4 ${submitting ? 'animate-pulse' : ''}`} />
                {submitting ? 'Enviando…' : t('contacto.enviar')}
              </Button>

              {/* Texto legal debajo del botón */}
              <p className="text-xs text-muted-foreground text-center mt-2">
                {t('contacto.legal')}
              </p>
            </div>
          </form>

          {/* Datos de contacto + Redes + QR */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground">
              {t('contacto.datosTitle')}
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
                {t('contacto.qrTitle')}
              </p>
              <div className="inline-block bg-white p-3 rounded-xl border border-border shadow-sm">
                <Image
                  src="/images/qr-contacto.png"
                  alt={t('contacto.qrTitle')}
                  width={128}
                  height={128}
                  className="w-32 h-32 object-contain"
                  style={{ width: '8rem', height: '8rem' }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {t('contacto.qrSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
