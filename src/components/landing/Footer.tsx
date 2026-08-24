'use client';

import { Mail, Instagram, Facebook, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from '@/components/language-selector';

/* ─── FOOTER ─── */
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-hominis-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="logo-shimmer logo-depth-dark mb-6 w-fit">
              <img
                src="/logo_hominis.png"
                alt={t('landing.footer.brandAlt')}
                className="h-20 w-auto object-contain rounded-2xl"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('landing.footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-hominis-gold">
              {t('landing.footer.navTitle')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '#inicio', label: t('landing.nav.home') },
                { href: '#sobre-mi', label: t('landing.nav.about') },
                { href: '#planes', label: t('landing.nav.plans') },
                { href: '#promociones', label: t('landing.nav.promotions') },
                { href: '#servicios', label: t('landing.nav.services') },
                { href: '#contacto', label: t('landing.nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-hominis-gold">
              {t('landing.footer.contactTitle')}
            </h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/5491165555534?text=Hola%20Agustina%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20las%20coberturas%20de%20salud.%20%C2%BFPodr%C3%ADas%20asesorarme%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <svg viewBox="0 0 32 32" className="w-4 h-4" fill="currentColor"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z"/></svg>
                11-6555-5534
              </a>
              <a
                href="mailto:acandia@mphominis.com.ar"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                acandia@mphominis.com.ar
              </a>
              <a
                href="#"
                role="button"
                aria-label={`${t('landing.contact.instagramLabel')} — ${t('landing.contact.comingSoonShort')}`}
                onClick={(e) => {
                  e.preventDefault();
                  toast.info(t('landing.contact.instagramToast.title'), {
                    description:
                      t('landing.contact.instagramToast.desc'),
                  });
                }}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>@hominisok</span>
                <span className="text-[10px] text-white/50">{t('landing.footer.comingSoon')}</span>
              </a>
              <a
                href="https://facebook.com/hominis_agustinacandiaasesor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
                hominis_agustinacandiaasesor
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Bottom bar */}
        <div className="pb-20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            {t('landing.footer.copyright', { year: String(new Date().getFullYear()) })}
          </p>
          <div className="flex items-center gap-4">
            <p>
              {t('landing.footer.legalNote')}
            </p>
            <a
              href="/login"
              className="text-white/40 hover:text-white/80 transition-colors"
              title={t('landing.footer.panelTitle')}
            >
              <Shield className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
