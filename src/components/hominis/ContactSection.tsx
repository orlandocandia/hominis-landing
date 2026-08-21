'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Phone, Mail, Facebook, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Datos de contacto de la clienta (landing de Hominis).
const WHATSAPP_DISPLAY = '+54 11 7619-9167'
const WHATSAPP_URL = 'https://wa.me/541176199167'
const EMAIL = 'asesoradesalud.info@gmail.com'
const FACEBOOK_URL = 'https://www.facebook.com/hominis'
const INSTAGRAM_URL = 'https://www.instagram.com/hominisok/'

/**
 * Sección de contacto de la landing de Hominis (www.asesoradesalud.com.ar).
 * El formulario hace POST a /api/contact, que envía el email a
 * asesoradesalud.info@gmail.com vía Gmail SMTP (configurado en route.ts).
 *
 * NOTA: este componente NO toca la landing de seguros (/seguros) ni la API
 * route; solo consume el endpoint compartido /api/contact.
 */
export function ContactSection() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
      className="w-full bg-muted/30 py-16"
      aria-labelledby="hominis-contacto-title"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2
            id="hominis-contacto-title"
            className="text-2xl md:text-3xl font-bold text-foreground"
          >
            Contactanos
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Completá el formulario y te contactaremos a la brevedad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 min-w-0"
            aria-label="Formulario de contacto"
          >
            {submitted && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3 text-sm text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                ¡Gracias! Tu solicitud fue enviada. Te contactaremos a la brevedad.
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input id="h-nombre" name="nombre" required type="text" placeholder="Tu nombre" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input id="h-telefono" name="telefono" required type="tel" placeholder="+54 9 ..." />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="h-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="h-email" name="email" required type="email" placeholder="tu@email.com" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="h-mensaje">Mensaje</Label>
              <Textarea
                id="h-mensaje"
                name="mensaje"
                rows={5}
                placeholder="Contanos qué necesitás (opcional)"
                className="min-h-[120px]"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className={`mr-2 h-4 w-4 ${submitting ? 'animate-pulse' : ''}`} />
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
          </form>

          {/* Datos de contacto */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-6 text-center">
            <h3 className="text-lg font-bold text-foreground">Datos de contacto</h3>
            <div className="flex flex-col gap-3 w-full">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition"
              >
                <Phone className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" aria-hidden />
                <span className="text-sm font-medium text-foreground">{WHATSAPP_DISPLAY}</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition"
              >
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden />
                <span className="text-sm font-medium text-foreground break-all">{EMAIL}</span>
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center justify-center p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition"
              >
                <Facebook className="h-5 w-5 text-[#1877F2] dark:text-blue-400" aria-hidden />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center p-3 rounded-lg border border-pink-200 bg-pink-50 dark:border-pink-900/50 dark:bg-pink-950/30 hover:bg-pink-100 dark:hover:bg-pink-950/50 transition"
              >
                <Instagram className="h-5 w-5 text-[#E4405F] dark:text-pink-400" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
