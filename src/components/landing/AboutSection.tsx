'use client';

import Image from 'next/image';
import { Shield, Award, UserCheck, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/language-selector';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

/* ─── ABOUT SECTION ─── */
export function AboutSection() {
  const { t } = useTranslation();
  return (
    <AnimatedSection id="sobre-mi" className="py-20 lg:py-28 bg-hominis-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-hominis-violet/10">
              <Image
                src="/hero-bg.png"
                alt={t('landing.about.imageAlt')}
                width={1200}
                height={675}
                priority
                className="w-full h-80 lg:h-[28rem] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-hominis-blue/80 to-hominis-violet/60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <Shield className="w-16 h-16 text-hominis-gold mb-4" />
                <h3 className="text-3xl font-serif font-bold text-white mb-2">
                  {t('landing.about.overlayTitle')}
                </h3>
                <p className="text-white/80 max-w-sm">
                  {t('landing.about.overlayText')}
                </p>
              </div>
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 glass rounded-2xl p-4 shadow-xl max-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{t('landing.about.experienceValue')}</div>
                  <div className="text-xs text-muted-foreground">{t('landing.about.experienceLabel')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div>
            <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
              {t('landing.nav.about')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-6">
              {t('landing.about.title')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('landing.about.description1.pre')}<strong className="text-foreground">{t('landing.about.description1.hominis')}</strong>{t('landing.about.description1.mid')}<strong className="text-hominis-violet">{t('landing.about.description1.vita')}</strong>{t('landing.about.description1.mid2')}<strong className="text-hominis-violet">{t('landing.about.description1.aqua')}</strong>{t('landing.about.description1.post')}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t('landing.about.description2')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: t('landing.about.feature1') },
                { icon: Clock, label: t('landing.about.feature2') },
                { icon: Shield, label: t('landing.about.feature3') },
                { icon: Heart, label: t('landing.about.feature4') },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-hominis-violet/5"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-hominis-blue/10 to-hominis-violet/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-hominis-violet" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
