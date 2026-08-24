'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector, useTranslation } from '@/components/language-selector';

/* ─── NAVBAR ─── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: t('landing.nav.home') },
    { href: '#sobre-mi', label: t('landing.nav.about') },
    { href: '#planes', label: t('landing.nav.plans') },
    { href: '#promociones', label: t('landing.nav.promotions') },
    { href: '#servicios', label: t('landing.nav.services') },
    { href: '#contacto', label: t('landing.nav.contact') },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-lg shadow-hominis-blue/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <a href="#inicio" className="logo-shimmer logo-depth block">
            <img
              src="/logo_hominis.png"
              alt={t('landing.footer.brandAlt')}
              className="h-14 sm:h-16 w-auto object-contain rounded-2xl"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-primary/5 transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
            <a href="#contacto">
              <Button
                size="sm"
                className="ml-3 bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white shadow-lg shadow-hominis-violet/25"
              >
                {t('landing.nav.asesorate')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Toggle + theme/lang */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <LanguageSelector />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/5"
            aria-label={t('landing.menu.toggle')}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all ${
                  mobileOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-foreground transition-all ${
                  mobileOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass border-t border-primary/10"
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary/5 hover:text-primary transition-all"
              >
                {link.label}
              </a>
            ))}
            <a href="#contacto" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-2 bg-gradient-to-r from-hominis-blue to-hominis-violet text-white">
                {t('landing.nav.asesorate')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
