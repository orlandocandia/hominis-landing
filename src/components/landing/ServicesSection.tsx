'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/components/language-selector';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

/* ─── DIGITAL SERVICES SECTION ─── */
export function ServicesSection() {
  const { t } = useTranslation();
  const services = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      title: t('landing.services.item1.title'),
      subtitle: t('landing.services.item1.subtitle'),
      description: t('landing.services.item1.description'),
      color: 'from-teal-500 to-cyan-500',
      detail: t('landing.services.item1.detail'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
      title: t('landing.services.item2.title'),
      subtitle: t('landing.services.item2.subtitle'),
      description: t('landing.services.item2.description'),
      color: 'from-purple-600 to-violet-500',
      detail: t('landing.services.item2.detail'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
      title: t('landing.services.item3.title'),
      subtitle: t('landing.services.item3.subtitle'),
      description: t('landing.services.item3.description'),
      color: 'from-hominis-blue to-hominis-indigo',
      detail: t('landing.services.item3.detail'),
    },
  ];

  return (
    <AnimatedSection id="servicios" className="py-20 lg:py-28 bg-white dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
            {t('landing.services.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
            {t('landing.services.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.services.description')}
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="group h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${svc.color} flex items-center justify-center mb-6 shadow-lg text-white`}>
                    {svc.icon}
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-1">
                    {svc.title}
                  </h3>
                  <p className="text-sm font-medium text-hominis-violet mb-4">
                    {svc.subtitle}
                  </p>
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                    {svc.description}
                  </p>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                    {svc.detail}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
