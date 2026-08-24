'use client';

import { motion } from 'framer-motion';
import { Shield, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/components/language-selector';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

/* ─── PLANS SECTION (Vita Más vs Aqua Más) ─── */
export function PlansSection() {
  const { t } = useTranslation();
  return (
    <AnimatedSection id="planes" className="py-20 lg:py-28 bg-white dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
            {t('landing.plans.title')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
            {t('landing.plans.subtitle')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.plans.description')}
          </p>
        </div>

        {/* Central message */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-purple-300" />
          <Shield className="w-8 h-8 text-hominis-violet" />
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-purple-300" />
        </div>

        {/* Two Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Vita Más */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="group h-full border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-1">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-700 to-violet-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <Badge className="bg-white/20 text-white border-white/30 mb-4">{t('landing.plans.vita.badge')}</Badge>
                <h3 className="text-3xl font-serif font-bold relative z-10 mb-2">
                  {t('landing.plans.vita.name')}
                </h3>
                <p className="text-white/80 text-sm relative z-10">
                  {t('landing.plans.vita.tagline')}
                </p>
                <p className="text-white/60 text-xs mt-2 relative z-10 italic">
                  {t('landing.plans.vita.italic')}
                </p>
              </div>

              <CardContent className="p-6 lg:p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: '💰', text: t('landing.plans.vita.feature1') },
                    { icon: '🎧', text: t('landing.plans.vita.feature2') },
                    { icon: '🏥', text: t('landing.plans.vita.feature3') },
                    { icon: '📅', text: t('landing.plans.vita.feature4') },
                    { icon: '🦷', text: t('landing.plans.vita.feature5') },
                    { icon: '📱', text: t('landing.plans.vita.feature6') },
                  ].map((feat) => (
                    <li key={feat.text} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{feat.icon}</span>
                      <span className="text-sm leading-relaxed">{feat.text}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contacto">
                  <Button className="w-full bg-gradient-to-r from-purple-700 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all text-base h-12 rounded-xl">
                    {t('landing.plans.vita.cta')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>

          {/* Aqua Más */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="group h-full border-2 border-teal-200 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-1">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <Badge className="bg-white/20 text-white border-white/30 mb-4">{t('landing.plans.aqua.badge')}</Badge>
                <h3 className="text-3xl font-serif font-bold relative z-10 mb-2">
                  {t('landing.plans.aqua.name')}
                </h3>
                <p className="text-white/80 text-sm relative z-10">
                  {t('landing.plans.aqua.tagline')}
                </p>
                <p className="text-white/60 text-xs mt-2 relative z-10 italic">
                  {t('landing.plans.aqua.italic')}
                </p>
              </div>

              <CardContent className="p-6 lg:p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: '💲', text: t('landing.plans.aqua.feature1') },
                    { icon: '🚑', text: t('landing.plans.aqua.feature2') },
                    { icon: '🏥', text: t('landing.plans.aqua.feature3') },
                    { icon: '✈️', text: t('landing.plans.aqua.feature4') },
                    { icon: '💊', text: t('landing.plans.aqua.feature5') },
                    { icon: '🧠', text: t('landing.plans.aqua.feature6') },
                    { icon: '🦷', text: t('landing.plans.aqua.feature7') },
                  ].map((feat) => (
                    <li key={feat.text} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{feat.icon}</span>
                      <span className="text-sm leading-relaxed">{feat.text}</span>
                    </li>
                  ))}
                </ul>

                <a href="#contacto">
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all text-base h-12 rounded-xl">
                    {t('landing.plans.aqua.cta')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Age Restriction Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">
                {t('landing.plans.ageNotice.title')}
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                {t('landing.plans.ageNotice.text.pre')}{' '}
                <strong>{t('landing.plans.ageNotice.text.highlight')}</strong>{t('landing.plans.ageNotice.text.post')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}
