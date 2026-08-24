'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/language-selector';

/* ─── HERO SECTION ─── */
export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-hominis-gradient" />
      <div className="absolute inset-0 hero-mesh" />

      {/* Decorative shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-hominis-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-hominis-purple/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hominis-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center w-full"
          >
            <Badge
              variant="secondary"
              className="mb-6 bg-white/15 text-white/90 border-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wider uppercase"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {t('landing.hero.badge')}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white leading-tight mb-6">
              {t('landing.hero.title')}{' '}
              <span className="text-hominis-gold">{t('landing.hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto text-center mb-8 leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col items-center gap-5">
              <a href="#contacto">
                <Button
                  size="lg"
                  className="bg-white text-hominis-blue hover:bg-white/90 font-semibold px-8 shadow-2xl shadow-black/20 text-base"
                >
                  {t('landing.hero.cta')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/15">
              {[
                { value: t('landing.hero.stat1.value'), label: t('landing.hero.stat1.label') },
                { value: t('landing.hero.stat2.value'), label: t('landing.hero.stat2.label') },
                { value: t('landing.hero.stat3.value'), label: t('landing.hero.stat3.label') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-hominis-gold">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-white/50" />
      </motion.div>
    </section>
  );
}
