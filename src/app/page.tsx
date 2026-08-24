'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Heart,
  Users,
  Briefcase,
  MapPin,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  Award,
  UserCheck,
  Building2,
  Star,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { UtmCapturer } from '@/components/utm-capturer';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector, useTranslation } from '@/components/language-selector';
import dynamic from 'next/dynamic';

function MapLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{t('landing.map.loading')}</p>
    </div>
  );
}

const MapWithAgustina = dynamic(() => import('@/components/MapWithAgustina'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── NAVBAR ─── */
function Navbar() {
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

/* ─── HERO SECTION ─── */
function HeroSection() {
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



/* ─── ABOUT SECTION ─── */
function AboutSection() {
  const { t } = useTranslation();
  return (
    <AnimatedSection id="sobre-mi" className="py-20 lg:py-28 bg-hominis-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-hominis-violet/10">
              <img
                src="/hero-bg.png"
                alt={t('landing.about.imageAlt')}
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

/* ─── PLANS SECTION (Vita Más vs Aqua Más) ─── */
function PlansSection() {
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

/* ─── PROMOTIONS SECTION ─── */
function PromotionsSection() {
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

/* ─── DIGITAL SERVICES SECTION ─── */
function ServicesSection() {
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

/* ─── SUCURSAL / OFICINA SECTION ─── */
/* ─── CONTACT FORM SECTION ─── */
function ContactSection() {
  const { t } = useTranslation();
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    segmento: '',
    cobertura: '',
    edad: '',
    mensaje: '',
  });

  useEffect(() => {
    fetch('/api/csrf')
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => console.error('Error fetching CSRF token'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Read UTM cookies (set by UtmCapturer) and append to form data
      const getCookie = (name: string) => {
        const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : '';
      };
      const payload = {
        ...formData,
        utmSource: getCookie('utm_source'),
        utmMedium: getCookie('utm_medium'),
        utmCampaign: getCookie('utm_campaign'),
        utmTerm: getCookie('utm_term'),
        utmContent: getCookie('utm_content'),
        referrer: getCookie('utm_referrer') || document.referrer,
      };
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          mensaje: formData.mensaje,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('landing.contact.errorForm'));
        return;
      }

      toast.success(
        data.ok ? t('landing.contact.success') : (data.error || t('landing.contact.errorForm'))
      );
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        segmento: '',
        cobertura: '',
        edad: '',
        mensaje: '',
      });

      // Refresh CSRF token
      const csrfRes = await fetch('/api/csrf');
      const csrfData = await csrfRes.json();
      setCsrfToken(csrfData.token);
    } catch {
      toast.error(t('landing.contact.errorConnection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedSection id="contacto" className="py-20 lg:py-28 bg-white dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Info */}
          <div>
            <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
              {t('landing.nav.contact')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
              {t('landing.contact.title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t('landing.contact.description')}
            </p>

            {/* Contact cards */}
            <div className="space-y-4 mb-8">
              <a
                href="https://wa.me/5491165555534?text=Hola%20Agustina%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20las%20coberturas%20de%20salud.%20%C2%BFPodr%C3%ADas%20asesorarme%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100 hover:bg-green-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 32 32" className="w-7 h-7" fill="white"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z"/></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-900">
                    {t('landing.contact.whatsappDirect')}
                  </div>
                  <div className="text-sm text-green-700">11-6555-5534</div>
                </div>
              </a>

              <a
                href="mailto:acandia@mphominis.com.ar"
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-hominis-blue to-hominis-indigo flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-900">
                    {t('landing.contact.emailLabel')}
                  </div>
                  <div className="text-sm text-blue-700">
                    acandia@mphominis.com.ar
                  </div>
                </div>
              </a>

              <div className="grid grid-cols-2 gap-4">
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
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 hover:from-pink-100 hover:to-purple-100 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-pink-900">@hominisok</div>
                    <div className="text-xs text-pink-600 flex items-center gap-1">
                      {t('landing.contact.instagramLabel')}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-medium leading-none">
                        {t('landing.contact.comingSoonShort')}
                      </span>
                    </div>
                  </div>
                </a>

                <a
                  href="https://facebook.com/hominis_agustinacandiaasesor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-blue-900">Hominis</div>
                    <div className="text-xs text-blue-600">Facebook</div>
                  </div>
                </a>
              </div>

              {/* QR Code WhatsApp */}
              <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                <p className="text-sm font-semibold text-green-900 mb-1">{t('landing.contact.qrTitle')}</p>
                <p className="text-xs text-green-700 mb-4">{t('landing.contact.qrSubtitle')}</p>
                <div className="bg-white p-3 rounded-2xl shadow-lg border border-green-200">
                  <QRCodeSVG
                    value="https://wa.me/5491165555534?text=Hola%20Agustina%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20las%20coberturas%20de%20salud.%20%C2%BFPodr%C3%ADas%20asesorarme%3F"
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#1a237e"
                    level="H"
                    imageSettings={{
                      src: "/logo_hominis.png",
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                </div>
                <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                  <svg viewBox="0 0 32 32" className="w-4 h-4" fill="#25D366"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z"/></svg>
                  {t('landing.contact.qrWhatsappLabel')} 11-6555-5534
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-hominis-blue to-hominis-violet p-6 text-white">
              <h3 className="text-xl font-serif font-bold">
                {t('landing.contact.formTitle')}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {t('landing.contact.formSubtitle')}
              </p>
            </div>
            <CardContent className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    {t('landing.contact.name')}
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder={t('landing.contact.namePlaceholder')}
                    required
                    minLength={2}
                    className="rounded-xl h-12"
                  />
                </div>

                {/* Email + Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('landing.contact.email')}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('landing.contact.emailPlaceholder')}
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium">
                      {t('landing.contact.phone')}
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder={t('landing.contact.phonePlaceholder')}
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                {/* Segmento + Edad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('landing.contact.situation')}</Label>
                    <Select
                      value={formData.segmento}
                      onValueChange={(val) =>
                        setFormData((p) => ({ ...p, segmento: val }))
                      }
                      required
                    >
                      <SelectTrigger className="w-full rounded-xl h-12 data-[size=default]:h-12">
                        <SelectValue placeholder={t('landing.contact.situationPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECIBO_DE_SUELDO">
                          {t('landing.contact.situationEmployee')}
                        </SelectItem>
                        <SelectItem value="MONOTRIBUTO">
                          {t('landing.contact.situationMono')}
                        </SelectItem>
                        <SelectItem value="PARTICULAR">
                          {t('landing.contact.situationParticular')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edad" className="text-sm font-medium">
                      {t('landing.contact.age')}
                    </Label>
                    <Input
                      id="edad"
                      name="edad"
                      type="number"
                      min={0}
                      max={64}
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder={t('landing.contact.agePlaceholder')}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                {/* Cobertura */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('landing.contact.coverage')}
                  </Label>
                  <Select
                    value={formData.cobertura}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, cobertura: val }))
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl h-12 data-[size=default]:h-12">
                      <SelectValue placeholder={t('landing.contact.coveragePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CABA">CABA</SelectItem>
                      <SelectItem value="GBA">GBA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-sm font-medium">
                    {t('landing.contact.message')}
                  </Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder={t('landing.contact.messagePlaceholder')}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !csrfToken}
                  className="w-full h-12 bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white font-semibold rounded-xl shadow-lg shadow-hominis-violet/25 text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {t('landing.contact.sending')}
                    </>
                  ) : (
                    <>
                      {t('landing.contact.submit')}
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t('landing.contact.legal')}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ─── FOOTER ─── */
function Footer() {
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

/* ─── MAIN PAGE ─── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <UtmCapturer />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <PlansSection />
        <PromotionsSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}



