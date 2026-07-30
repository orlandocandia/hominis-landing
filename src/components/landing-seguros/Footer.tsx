'use client'

import Image from 'next/image'
import { Phone, Mail, Facebook, Instagram } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

// Número de WhatsApp real de la clienta (formato internacional sin + ni espacios)
const WHATSAPP_NUMBER = '5493810000000'
const WHATSAPP_DISPLAY = '+54 9 381 000-0000'
const EMAIL = 'info@asesoradesalud.com.ar'
const FACEBOOK_URL = 'https://facebook.com/tu-pagina'
const INSTAGRAM_URL = 'https://instagram.com/tu-perfil'

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-auto w-full border-t border-border bg-muted/30"
      aria-label={t('seguros.nav.contacto')}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="text-center space-y-6">
          {/* Logo + nombre */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/images/seguros/tuasesoraensalud-logo.png"
              alt={t('seguros.brand')}
              width={80}
              height={40}
              style={{ height: '2.5rem', width: 'auto' }}
              className="object-contain"
            />
            <span className="text-base font-bold text-foreground">
              {t('seguros.brand')}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('seguros.footer.tagline')}
          </p>

          {/* Datos de contacto con iconos (fila horizontal en desktop, wrap en mobile) */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden />
              {EMAIL}
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Facebook className="h-4 w-4 text-[#1877F2] dark:text-blue-400" aria-hidden />
              Facebook
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition"
            >
              <Instagram className="h-4 w-4 text-[#E4405F] dark:text-pink-400" aria-hidden />
              Instagram
            </a>
          </div>

          {/* Copyright + dominio */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
            <p>
              © {year} {t('seguros.brand')}. {t('seguros.footer.copyright')}
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
