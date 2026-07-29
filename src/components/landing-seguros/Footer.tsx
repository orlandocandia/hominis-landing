'use client'

import Image from 'next/image'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

const LEGAL_LINKS = [
  { label: 'Términos y condiciones', href: '#' },
  { label: 'Política de privacidad', href: '#' },
  { label: 'Defensa al consumidor', href: '#' },
]

// Número de WhatsApp real de la clienta (formato internacional sin + ni espacios)
const WHATSAPP_NUMBER = '5493810000000'
const WHATSAPP_DISPLAY = '+54 9 381 000-0000'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto w-full border-t border-border bg-muted/30"
      aria-label="Pie de página"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marca + tagline + botón WhatsApp */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
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
            <p className="text-sm text-muted-foreground max-w-xs">
              Asesoramiento en salud. Compará las mejores opciones con
              asesoría personalizada y sin costo.
            </p>
            {/* Botón de WhatsApp prominente */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition self-start"
            >
              <MessageCircle className="w-5 h-5" aria-hidden />
              Contactar por WhatsApp
            </a>
          </div>

          {/* Datos de contacto */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition"
                >
                  <Phone className="h-4 w-4 text-blue-600" aria-hidden />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@asesoradesalud.com.ar"
                  className="flex items-center gap-2 hover:text-foreground transition"
                >
                  <Mail className="h-4 w-4 text-blue-600" aria-hidden />
                  info@asesoradesalud.com.ar
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5" aria-hidden />
                San Miguel de Tucumán, Tucumán, Argentina
              </li>
            </ul>
          </div>

          {/* Links legales */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {year} Tu Asesora en Salud — Asesoramiento en salud. Todos los
            derechos reservados.
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
    </footer>
  )
}
