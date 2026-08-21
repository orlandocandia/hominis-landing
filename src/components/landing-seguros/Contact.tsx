'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Phone, Mail, Facebook, Instagram, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from './useTranslation'

// Datos de contacto y redes sociales
const WHATSAPP_NUMBER = '541176199167'
const WHATSAPP_DISPLAY = '+54 11 7619-9167'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
const EMAIL = 'asesoradesalud.info@gmail.com'
const FACEBOOK_URL = 'https://www.facebook.com/hominis'
const FACEBOOK_DISPLAY = 'Hominis'
const INSTAGRAM_URL = 'https://www.instagram.com/hominisok/'
const INSTAGRAM_DISPLAY = '@hominisok (Próximamente)'

interface ContactLink {
  href: string
  icon: typeof Phone
  iconColor: string
  bgClass: string
  hoverClass: string
  borderClass: string
  display: string
  external?: boolean
  social?: boolean
}

export function Contact() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Links de contacto con dark: variants para modo oscuro
  const CONTACT_LINKS: ContactLink[] = [
    {
      href: WHATSAPP_URL,
      icon: Phone,
      iconColor: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
      hoverClass: 'hover:bg-green-100 dark:hover:bg-green-950/50',
      borderClass: 'border-green-200 dark:border-green-900/50',
      display: WHATSAPP_DISPLAY,
      external: true,
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
      social: true,
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
      social: true,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden min-w-0"
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
                <label htmlFor="mensaje" className="text-sm font-medium text-foreground">
                  {t('contacto.mensaje')}
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={5}
                  placeholder={t('contacto.mensajePlaceholder')}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
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

          {/* WhatsApp Directo + QR + datos — contenedor profesional (shadow, rounded, padding) */}
          <div className="flex flex-col items-center gap-4 h-full justify-center bg-white dark:bg-card shadow-lg rounded-2xl p-8 md:p-10 border border-border">
            {/* Datos de contacto (primero) */}
            <div className="flex flex-col gap-3 w-full">
              {CONTACT_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    aria-label={link.display}
                    className={`flex items-center ${link.social ? 'justify-center' : 'gap-3'} p-3 rounded-lg border transition ${link.bgClass} ${link.hoverClass} ${link.borderClass}`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${link.iconColor}`} aria-hidden />
                    {!link.social && (
                      <span className="text-sm font-medium text-foreground">
                        {link.display}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>

            {/* Divider */}
            <div className="w-full border-t border-border my-1" />

            {/* Título */}
            <h3 className="text-xl md:text-2xl font-bold text-foreground text-center">
              WhatsApp Directo
            </h3>

            {/* Texto arriba del QR */}
            <p className="text-sm md:text-base font-medium text-foreground text-center">
              Escaneá y escribí a Agustina
            </p>

            {/* QR (chico) */}
            <div className="inline-block bg-white p-3 rounded-2xl border-2 border-[#077B7A]/30 shadow-lg">
              <Image
                src="/images/qr-contacto.png"
                alt="WhatsApp +54 11 7619-9167"
                width={144}
                height={144}
                className="object-contain"
                style={{ width: '9rem', height: '9rem' }}
                priority
              />
            </div>

            {/* Texto abajo del QR */}
            <p className="text-sm text-muted-foreground text-center">
              Apretá con la cámara de tu celular
            </p>

            {/* Texto al pie */}
            <p className="text-sm md:text-base font-semibold text-[#077B7A] text-center mt-1">
              WhatsApp +54 11 7619-9167
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
