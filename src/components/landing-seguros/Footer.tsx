'use client'

import Image from 'next/image'
import { Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react'

const LEGAL_LINKS = [
  { label: 'Términos y condiciones', href: '#' },
  { label: 'Política de privacidad', href: '#' },
  { label: 'Defensa al consumidor', href: '#' },
]

// Número de WhatsApp real de la clienta (formato internacional sin + ni espacios)
const WHATSAPP_NUMBER = '5493810000000'
const WHATSAPP_DISPLAY = '+54 9 381 000-0000'
const EMAIL = 'info@asesoradesalud.com.ar'
const FACEBOOK_URL = 'https://facebook.com/tu-pagina'
const INSTAGRAM_URL = 'https://instagram.com/tu-perfil'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto w-full border-t border-border bg-muted/30"
      aria-label="Pie de página"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="text-center space-y-6">
          {/* Logo + nombre */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/images/seguros/tuasesoraensalud-logo.png"
              alt="Tu Asesora en Salud"
              width={80}
              height={40}
              style={{ height: '2.5rem', width: 'auto' }}
              className="object-contain"
            />
            <span className="text-base font-bold text-foreground">
              Tu Asesora en Salud
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Asesoramiento en salud. Compará las mejores opciones con asesoría
            personalizada y sin costo.
          </p>

          {/* Botón de WhatsApp prominente */}
          <div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
            >
              <MessageCircle className="w-5 h-5" aria-hidden />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Datos de contacto con iconos (fila horizontal en desktop, wrap en mobile) */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Phone className="h-4 w-4 text-green-600" aria-hidden />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Mail className="h-4 w-4 text-blue-600" aria-hidden />
              {EMAIL}
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Facebook className="h-4 w-4 text-[#1877F2]" aria-hidden />
              Facebook
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Instagram className="h-4 w-4 text-[#E4405F]" aria-hidden />
              Instagram
            </a>
          </div>

          {/* Links legales */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {LEGAL_LINKS.map((link, index) => (
              <span key={link.label} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-border" aria-hidden>
                    •
                  </span>
                )}
                <a
                  href={link.href}
                  className="hover:text-foreground transition"
                >
                  {link.label}
                </a>
              </span>
            ))}
          </div>

          {/* Copyright + dominio */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
            <p>
              © {year} Tu Asesora en Salud. Todos los derechos reservados.
            </p>
            <p className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                aria-hidden
              />
              cotiza.asesoradesalud.com.ar
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
