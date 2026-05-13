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
import { WhatsAppButton } from '@/components/whatsapp-button';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#sobre-mi', label: 'Sobre Mí' },
    { href: '#segmentos', label: 'Segmentos' },
    { href: '#cobertura', label: 'Cobertura' },
    { href: '#contacto', label: 'Contacto' },
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
              alt="Hominis Logo"
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
            <a href="#contacto">
              <Button
                size="sm"
                className="ml-3 bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white shadow-lg shadow-hominis-violet/25"
              >
                Asesorate
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/5"
            aria-label="Abrir menú"
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
                Asesorate <ArrowRight className="w-4 h-4 ml-1" />
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <Badge
              variant="secondary"
              className="mb-6 bg-white/15 text-white/90 border-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wider uppercase"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Asesora Comercial Hominis
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white leading-tight mb-6">
              Tu bienestar,{' '}
              <span className="text-hominis-gold">mi compromiso</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
              Soy{' '}
              <strong className="text-white font-semibold">
                Agustina C. Candia
              </strong>
              , asesora comercial especializada en coberturas de salud.
              Acompaño a particulares, monotributistas y empleados en relación
              de dependencia a encontrar la protección ideal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#contacto">
                <Button
                  size="lg"
                  className="bg-white text-hominis-blue hover:bg-white/90 font-semibold px-8 shadow-2xl shadow-black/20 text-base"
                >
                  Solicitar Asesoramiento
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <a href="#segmentos">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 text-base backdrop-blur-sm"
                >
                  Ver Segmentos
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/15">
              {[
                { value: '500+', label: 'Clientes Asesorados' },
                { value: '10+', label: 'Años de Experiencia' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
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

          {/* Profile Photo */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-hominis-accent to-hominis-gold rounded-full opacity-30 blur-xl animate-pulse-glow" />
              
              {/* Photo container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl shadow-hominis-violet/30">
                <img
                  src="/agustina_c_candia.png"
                  alt="Agustina C. Candia - Asesora Comercial Hominis"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-hominis-blue/30 via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass px-5 py-2 rounded-full shadow-xl">
                <span className="text-xs font-semibold text-hominis-blue flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Asesora Certificada
                </span>
              </div>
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
  return (
    <AnimatedSection id="sobre-mi" className="py-20 lg:py-28 bg-hominis-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-hominis-violet/10">
              <img
                src="/hero-bg.png"
                alt="Hominis - Protección y confianza"
                className="w-full h-80 lg:h-[28rem] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-hominis-blue/80 to-hominis-violet/60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <Shield className="w-16 h-16 text-hominis-gold mb-4" />
                <h3 className="text-3xl font-serif font-bold text-white mb-2">
                  Protección que se adapta a vos
                </h3>
                <p className="text-white/80 max-w-sm">
                  Cada persona es única. Mi misión es encontrar la cobertura
                  perfecta para tu estilo de vida.
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
                  <div className="text-sm font-bold text-foreground">+10 años</div>
                  <div className="text-xs text-muted-foreground">de trayectoria</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div>
            <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
              Sobre Mí
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-6">
              Asesoría personalizada con respaldo institucional
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Como asesora comercial de <strong className="text-foreground">Hominis</strong>,
              me dedico a brindar un servicio cercano y profesional, entendiendo
              las necesidades de cada cliente para ofrecer las mejores soluciones
              en cobertura de salud.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Trabajo con las principales prestadoras del mercado, garantizando
              opciones flexibles que se ajustan a cada situación particular,
              ya seas independiente, monotributista o empleado en relación de
              dependencia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: 'Atención personalizada' },
                { icon: Clock, label: 'Respuesta inmediata' },
                { icon: Shield, label: 'Respaldo Hominis' },
                { icon: Heart, label: 'Compromiso genuino' },
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

/* ─── SEGMENTS SECTION ─── */
function SegmentsSection() {
  const segments = [
    {
      icon: Heart,
      title: 'Particulares',
      description:
        'Cobertura integral de salud para vos y tu familia. Planes flexibles con la mejor relación costo-beneficio del mercado.',
      features: [
        'Consultas médicas ilimitadas',
        'Prácticas y estudios incluidos',
        'Cobertura odontológica',
        'Internación y cirugía',
        'Programa de prevención',
      ],
      color: 'from-blue-600 to-indigo-700',
      accent: 'bg-blue-50 text-blue-700 border-blue-100',
      badge: 'bg-blue-100 text-blue-800',
    },
    {
      icon: Briefcase,
      title: 'Monotributistas',
      description:
        'Soluciones especialmente diseñadas para trabajadores independientes. Accedé a cobertura premium con beneficios exclusivos.',
      features: [
        'Deducción impositiva',
        'Planes escalonados por categoría',
        'Cobertura para grupo familiar',
        'Sin carencias extensas',
        'Asesoramiento impositivo',
      ],
      color: 'from-violet-600 to-purple-700',
      accent: 'bg-violet-50 text-violet-700 border-violet-100',
      badge: 'bg-violet-100 text-violet-800',
    },
    {
      icon: Building2,
      title: 'Empleados en Relación de Dependencia',
      description:
        'Si trabajás con recibo de sueldo, accedé a beneficios corporativos exclusivos con descuentos especiales.',
      features: [
        'Descuentos por nómina',
        'Cobertura para familiares',
        'Beneficios corporativos',
        'Deducción del recibo de sueldo',
        'Asistencia al trabajador',
      ],
      color: 'from-hominis-indigo to-hominis-purple',
      accent: 'bg-purple-50 text-purple-700 border-purple-100',
      badge: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <AnimatedSection id="segmentos" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
            Segmentos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
            Cobertura pensada para cada necesidad
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Elegí el segmento que mejor se adapte a tu situación y descubrí
            las opciones que tengo para vos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-1">
                {/* Gradient header */}
                <div
                  className={`bg-gradient-to-r ${seg.color} p-8 text-white relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <seg.icon className="w-12 h-12 mb-4 relative z-10" />
                  <h3 className="text-2xl font-serif font-bold relative z-10">
                    {seg.title}
                  </h3>
                </div>

                <CardContent className="p-6 lg:p-8">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {seg.description}
                  </p>

                  <ul className="space-y-3 mb-6">
                    {seg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#contacto">
                    <Button
                      className={`w-full bg-gradient-to-r ${seg.color} text-white shadow-md hover:shadow-lg transition-all`}
                    >
                      Consultar Planes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                Importante: Restricción de Edad
              </h4>
              <p className="text-sm text-amber-800 leading-relaxed">
                La cobertura de salud está disponible para clientes de{' '}
                <strong>hasta 64 años de edad</strong>. Si tenés dudas sobre tu
                elegibilidad, contactame y te asesorare personalmente.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

/* ─── COVERAGE SECTION ─── */
function CoverageSection() {
  const coverages = [
    {
      icon: MapPin,
      title: 'Buenos Aires',
      description:
        'Amplia red de prestadores en CABA y Provincia de Buenos Aires. Sanatorios y clínicas de primer nivel.',
      features: [
        'Red de +500 prestadores',
        'Sanatorios de referencia',
        'Urgencias 24/7',
        'Centros de diagnóstico',
      ],
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Globe,
      title: 'Cobertura Nacional',
      description:
        'Protección en todo el territorio argentino. Viajá con la tranquilidad de estar cubierto en cualquier provincia.',
      features: [
        'Cobertura en todas las provincias',
        'Trasladados y urgencias',
        'Convenios nacionales',
        'Telemedicina',
      ],
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: Star,
      title: 'Cobertura Internacional',
      description:
        'Para quienes necesitan protección más allá de las fronteras. Asistencia médica en el exterior con estándares internacionales.',
      features: [
        'Asistencia en el exterior',
        'Traslados sanitarios',
        'Repatriación sanitaria',
        'Convenios internacionales',
      ],
      gradient: 'from-hominis-indigo to-hominis-violet',
    },
  ];

  return (
    <AnimatedSection id="cobertura" className="py-20 lg:py-28 bg-hominis-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
            Cobertura Geográfica
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
            Protección donde sea que estés
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Desde Buenos Aires hasta cualquier parte del mundo, contás con
            respaldo médico integral.
          </p>
        </div>

        {/* Coverage Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {coverages.map((cov, i) => (
            <motion.div
              key={cov.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="group h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1">
                <CardContent className="p-8">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${cov.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <cov.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-3">
                    {cov.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    {cov.description}
                  </p>
                  <ul className="space-y-2.5">
                    {cov.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${cov.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

/* ─── CONTACT FORM SECTION ─── */
function ContactSection() {
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
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error al enviar el formulario');
        return;
      }

      toast.success(
        data.message || '¡Gracias! Nos pondremos en contacto pronto.'
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
      toast.error('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedSection id="contacto" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Info */}
          <div>
            <Badge variant="secondary" className="mb-4 text-hominis-violet bg-hominis-violet/10 border-hominis-violet/20">
              Contacto
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold gradient-text mb-4">
              ¿Listo para cuidar tu salud?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Completá el formulario y me comunico con vos en menos de 24 horas.
              También podés contactarme directamente por los siguientes canales:
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
                    WhatsApp Directo
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
                    Email
                  </div>
                  <div className="text-sm text-blue-700">
                    acandia@mphominis.com.ar
                  </div>
                </div>
              </a>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://instagram.com/hominisok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 hover:from-pink-100 hover:to-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-pink-900">@hominisok</div>
                    <div className="text-xs text-pink-600">Instagram</div>
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
            </div>
          </div>

          {/* Right side - Form */}
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-hominis-blue to-hominis-violet p-6 text-white">
              <h3 className="text-xl font-serif font-bold">
                Solicitar Asesoramiento
              </h3>
              <p className="text-white/70 text-sm mt-1">
                Completá tus datos y te contacto a la brevedad
              </p>
            </div>
            <CardContent className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    Nombre completo *
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre y apellido"
                    required
                    minLength={2}
                    className="rounded-xl h-12"
                  />
                </div>

                {/* Email + Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium">
                      Teléfono / WhatsApp *
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="11-xxxx-xxxx"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                {/* Segmento + Edad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Segmento *</Label>
                    <Select
                      value={formData.segmento}
                      onValueChange={(val) =>
                        setFormData((p) => ({ ...p, segmento: val }))
                      }
                      required
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Seleccioná tu segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTICULAR">
                          Particular
                        </SelectItem>
                        <SelectItem value="MONOTRIBUTISTA">
                          Monotributista
                        </SelectItem>
                        <SelectItem value="EMPLEADO_DEPENDENCIA">
                          Empleado en Rel. Dependencia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edad" className="text-sm font-medium">
                      Edad
                    </Label>
                    <Input
                      id="edad"
                      name="edad"
                      type="number"
                      min={0}
                      max={64}
                      value={formData.edad}
                      onChange={handleChange}
                      placeholder="Máximo 64 años"
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                {/* Cobertura */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Cobertura de interés
                  </Label>
                  <Select
                    value={formData.cobertura}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, cobertura: val }))
                    }
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Seleccioná cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSAS">Buenos Aires</SelectItem>
                      <SelectItem value="NACIONAL">Nacional</SelectItem>
                      <SelectItem value="INTERNACIONAL">
                        Internacional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="text-sm font-medium">
                    Mensaje (opcional)
                  </Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Contame qué necesitás o cualquier consulta..."
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
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Solicitud
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este formulario, aceptás que me comunique con vos
                  para brindarte asesoramiento. Tus datos están protegidos.
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
                alt="Hominis Logo"
                className="h-20 w-auto object-contain rounded-2xl"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Asesoría comercial personalizada en coberturas de salud.
              Compromiso, profesionalismo y atención cercana.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-hominis-gold">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '#inicio', label: 'Inicio' },
                { href: '#sobre-mi', label: 'Sobre Mí' },
                { href: '#segmentos', label: 'Segmentos' },
                { href: '#cobertura', label: 'Cobertura' },
                { href: '#contacto', label: 'Contacto' },
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
              Contacto
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
                href="https://instagram.com/hominisok"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @hominisok
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
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} Agustina C. Candia — Asesora Comercial
            Hominis. Todos los derechos reservados.
          </p>
          <p>
            Cobertura disponible para clientes de hasta 64 años
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN PAGE ─── */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <SegmentsSection />
        <CoverageSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
