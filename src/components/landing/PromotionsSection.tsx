'use client';

import { motion } from 'framer-motion';
import { Users, CreditCard, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/components/language-selector';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

/* ─── PROMOTIONS SECTION ─── */
export function PromotionsSection() {
  const { t } = useTranslation();
  const promos = [
    {
      plan: t('landing.plans.aqua.name'),
      planColor: 'from-teal-600 to-cyan-600',
      badge: 'bg-teal-100 text-teal-800',
      maxAge: 39,
      tiers: [
        { months: t('landing.promotions.tier1'), discount: 40 },
        { months: t('landing.promotions.tier2'), discount: 30 },
        { months: t('landing.promotions.tier3'), discount: 20 },
      ],
    },
    {
      plan: t('landing.plans.vita.name'),
      planColor: 'from-purple-700 to-violet-600',
      badge: 'bg-purple-100 text-purple-800',
      maxAge: 39,
      tiers: [
        { months: t('landing.promotions.tier1'), discount: 30 },
        { months: t('landing.promotions.tier4'), discount: 20 },
      ],
    },
  ];

  return (
    <AnimatedSection id="promociones" className="py-20 lg:py-28 bg-hominis-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
            {t('landing.promotions.badge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
            {t('landing.promotions.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.promotions.description')}
          </p>
        </div>

        {/* Promo Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.plan}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="h-full border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${promo.planColor} p-6 text-white text-center`}>
                  <p className="text-sm font-medium text-white/70 uppercase tracking-wider">{t('landing.promotions.planLabel')}</p>
                  <h3 className="text-2xl font-serif font-bold mt-1">{promo.plan}</h3>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4 mb-6">
                    {promo.tiers.map((tier, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {tier.months}
                        </span>
                        <span className={`text-2xl font-bold ${
                          tier.discount === 40 ? 'text-teal-600' :
                          tier.discount === 30 ? 'text-purple-600' : 'text-indigo-600'
                        }`}
                        >
                          {tier.discount}% {t('landing.promotions.off')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-hominis-violet" />
                      <span>{t('landing.promotions.ageCondition.pre')}<strong>{promo.maxAge} {t('landing.promotions.ageCondition.years')}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-hominis-violet" />
                      <span>{t('landing.promotions.paymentMethod')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>{t('landing.promotions.notCumulative')}</span>
                    </div>
                  </div>

                  <a href="#contacto" className="block mt-6">
                    <Button className={`w-full bg-gradient-to-r ${promo.planColor} text-white shadow-md hover:shadow-lg transition-all rounded-xl h-11`}>
                      {t('landing.promotions.cta')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
