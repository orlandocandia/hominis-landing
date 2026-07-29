'use client'

import { Menu, X, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { scrollToSection } from './companies'

const NAV_LINKS = [
  { href: '#top', label: 'Inicio' },
  { href: '#empresas', label: 'Empresas' },
  { href: '#como-funciona', label: '¿Cómo funciona?' },
  { href: '#contacto', label: 'Contacto' },
]

export function MenuNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      setMobileOpen(false)
      scrollToSection(href)
    },
    [],
  )

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, '#top')}
          className="flex items-center"
          aria-label="Inicio — Tu Asesora en Salud"
        >
          <Image
            src="/images/seguros/tuasesoraensalud-logo.png"
            alt="Tu Asesora en Salud"
            width={320}
            height={80}
            priority
            className="object-contain"
            style={{ height: '5rem', width: 'auto' }}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex gap-2 bg-gradient-to-r from-blue-600 to-cyan-500"
          >
            <a
              href="#contacto"
              onClick={(e) => handleNavClick(e, '#contacto')}
            >
              Asesorate
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <button
            type="button"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t border-border px-4 py-3 space-y-1 bg-background"
          aria-label="Navegación móvil"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={(e) => handleNavClick(e, '#contacto')}
            className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-2 text-sm font-bold text-white text-center"
          >
            Asesorate
            <ArrowRight className="w-4 h-4" />
          </a>
        </nav>
      )}
    </header>
  )
}
