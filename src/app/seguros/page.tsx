'use client';

import { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, Phone, Mail, MapPin, Stethoscope, Heart, Pill,
  Syringe, PawPrint, Plane, Smartphone, Building2, ArrowRight, Menu, X,
  ChevronDown, Loader2, Search, Globe, Instagram, Facebook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { toast } from 'sonner';

const DOCTORED_PLANS = [
  { name: 'Plan500', desc: 'Con tus aportes. Cobertura médica de calidad sin cuota mensual.' },
  { name: 'Plan1000', desc: 'Tu primer plan privado. Cobertura completa y excelente cartilla médica.' },
  { name: 'Plan2000', desc: 'Más cobertura y comodidad. Mayor nivel de prestaciones.' },
  { name: 'Plan3000', desc: 'Cobertura total sin límites. El plan más completo.' },
];

const DOCTORED_BENEFITS = [
  'Sin copagos en consultas, urgencias, laboratorio e imágenes',
  'Prestadores de calidad',
  'Atención personalizada',
  'App para gestionar tu cobertura',
  'Red médica en todo el país',
];

const PREMEDIC_BENEFITS = [
  { icon: Stethoscope, text: 'Telemedicina' },
  { icon: Smartphone, text: 'Médico IA 24/7' },
  { icon: Syringe, text: 'Vacunación en casa' },
  { icon: PawPrint, text: 'Veterinaria a domicilio (Amar Mascotas)' },
  { icon: Plane, text: 'Asistencia al viajero (Cardinal Assistance)' },
  { icon: Building2, text: 'Centros médicos PMC' },
  { icon: Pill, text: 'Descuentos en Farmacity' },
  { icon: Smartphone, text: 'App Premedic Móvil' },
];

const PROVINCIAS = ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza'];
const LOCALIDADES: Record<string, string[]> = {
  'Buenos Aires': ['Lomas de Zamora', 'La Plata', 'Morón', 'Quilmes'],
  'CABA': ['Palermo', 'Caballito', 'Belgrano', 'Recoleta'],
  'Córdoba': ['Córdoba Capital', 'Villa María', 'Río Cuarto'],
  'Santa Fe': ['Rosario', 'Santa Fe Capital', 'Rafaela'],
  'Mendoza': ['Mendoza Capital', 'Godoy Cruz', 'San Rafael'],
};

// Mock prestadores (in production would come from API)
const PRESTADORES_MOCK = [
  { id: '1', nombre: 'Centro Médico PMC', direccion: 'Av. Corrientes 1234, CABA', telefono: '11-5555-1234', distancia: 2.5, lat: -34.6037, lng: -58.3816, empresa: 'premedic' },
  { id: '2', nombre: 'Hospital DoctoRed', direccion: 'Av. Santa Fe 5678, CABA', telefono: '11-5555-5678', distancia: 3.8, lat: -34.5901, lng: -58.4105, empresa: 'doctored' },
  { id: '3', nombre: 'Clínica Premedic Lomas', direccion: 'Portela 200, Lomas de Zamora', telefono: '11-5555-9012', distancia: 1.2, lat: -34.7634, lng: -58.4045, empresa: 'premedic' },
  { id: '4', nombre: 'Sanatorio DoctoRed Norte', direccion: 'Av. Cabildo 1234, CABA', telefono: '11-5555-3456', distancia: 5.1, lat: -34.5615, lng: -58.4561, empresa: 'doctored' },
];

export default function SegurosPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenu(false);
  };

  // Intersection Observer - update active section on scroll
  useEffect(() => {
    const sections = ['inicio', 'doctored', 'premedic', 'cartilla', 'contacto'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Cartilla empresa is now set directly by nav clicks (more reliable than observer)
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', empresaId: '', plan: '', mensaje: '' });

  // Cartilla state
  const [cartEmpresa, setCartEmpresa] = useState<'doctored' | 'premedic'>('doctored');
  const [empresasDropdown, setEmpresasDropdown] = useState(false);
  const [cartProvincia, setCartProvincia] = useState('');
  const [cartLocalidad, setCartLocalidad] = useState('');
  const [cartPlan, setCartPlan] = useState('');
  const [cartEspecialidad, setCartEspecialidad] = useState('');
  const [cartResults, setCartResults] = useState<typeof PRESTADORES_MOCK>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);

  useEffect(() => { setCartMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.telefono || !form.empresaId) {
      toast.error('Nombre, email, teléfono y empresa son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const empresaNombre = form.empresaId === 'emp_doctored_001' ? 'DoctoRed' : 'Grupo Premedic';
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre, email: form.email, telefono: form.telefono,
          segmento: 'PARTICULAR',
          mensaje: `Empresa: ${empresaNombre} | Plan: ${form.plan || 'No especificado'} | ${form.mensaje}`,
          cobertura: 'CABA', empresaId: form.empresaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('¡Solicitud enviada! Te contactaremos a la brevedad.');
      setForm({ nombre: '', email: '', telefono: '', empresaId: '', plan: '', mensaje: '' });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al enviar');
    } finally { setLoading(false); }
  };

  const handleCartSearch = () => {
    if (!cartProvincia && !cartLocalidad) return;
    setCartLoading(true);
    // Mock search — in production this would call /api/cartilla/doctored or /api/cartilla/premedic
    setTimeout(() => {
      setCartResults(PRESTADORES_MOCK);
      setCartLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-green-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold">Seguros de Salud</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <button onClick={() => scrollToSection('inicio')} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === 'inicio' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Inicio</button>
            <div className="relative">
              <button
                onClick={() => setEmpresasDropdown(!empresasDropdown)}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Empresas <ChevronDown className={`h-4 w-4 transition-transform ${empresasDropdown ? 'rotate-180' : ''}`} />
              </button>
              {empresasDropdown && (
                <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border bg-card shadow-lg z-50">
                  <button
                    onClick={() => { setCartEmpresa('doctored'); setEmpresasDropdown(false); scrollToSection('doctored'); }}
                    className={`block w-full px-4 py-3 text-left text-sm hover:bg-muted rounded-t-xl ${cartEmpresa === 'doctored' ? 'bg-primary/10' : ''}`}
                  >
                    <span className="font-semibold" style={{ color: '#1a73e8' }}>DoctoRed</span>
                    <p className="text-xs text-muted-foreground">Planes flexibles sin copagos</p>
                  </button>
                  <button
                    onClick={() => { setCartEmpresa('premedic'); setEmpresasDropdown(false); scrollToSection('premedic'); }}
                    className={`block w-full px-4 py-3 text-left text-sm hover:bg-muted rounded-b-xl ${cartEmpresa === 'premedic' ? 'bg-primary/10' : ''}`}
                  >
                    <span className="font-semibold" style={{ color: '#2e7d32' }}>Grupo Premedic</span>
                    <p className="text-xs text-muted-foreground">Respaldo y amplia red médica</p>
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => scrollToSection('cartilla')} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === 'cartilla' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Cartilla</button>
            <button onClick={() => scrollToSection('contacto')} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${activeSection === 'contacto' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Contacto</button>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <button className="rounded-lg p-2 hover:bg-muted md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <nav className="border-t px-4 py-3 md:hidden">
            <button onClick={() => scrollToSection('inicio')} className={`block w-full py-2 text-left text-sm ${activeSection === 'inicio' ? 'text-primary font-medium' : ''}`}>Inicio</button>
            <button onClick={() => { setCartEmpresa('doctored'); scrollToSection('doctored'); }} className={`block w-full py-2 text-left text-sm ${cartEmpresa === 'doctored' ? 'text-primary font-medium' : ''}`}>DoctoRed</button>
            <button onClick={() => { setCartEmpresa('premedic'); scrollToSection('premedic'); }} className={`block w-full py-2 text-left text-sm ${cartEmpresa === 'premedic' ? 'text-primary font-medium' : ''}`}>Grupo Premedic</button>
            <button onClick={() => scrollToSection('cartilla')} className={`block w-full py-2 text-left text-sm ${activeSection === 'cartilla' ? 'text-primary font-medium' : ''}`}>Cartilla</button>
            <button onClick={() => scrollToSection('contacto')} className={`block w-full py-2 text-left text-sm ${activeSection === 'contacto' ? 'text-primary font-medium' : ''}`}>Contacto</button>
          </nav>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section id="inicio" className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-green-600" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)' }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <Badge className="mb-6 border-white/20 bg-white/15 px-4 py-1.5 text-xs uppercase tracking-wider text-white backdrop-blur">
            <Shield className="mr-1.5 h-3.5 w-3.5" /> Asesoría sin costo
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Encontrá el plan de salud<br />que mejor se adapta a vos
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 sm:text-xl">
            Asesoría personalizada en planes de salud de distintas empresas con más de 10 años de experiencia. Te ayudo a elegir cuál te conviene más, qué planes se adaptan a vos, calidad médica y diferentes formas de pago.
          </p>
          <button onClick={() => scrollToSection('contacto')} className="inline-block">
            <Button size="lg" className="bg-white px-8 text-base font-semibold text-blue-600 shadow-2xl hover:bg-white/90">
              📋 Solicitar Asesoramiento <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </button>
        </div>
      </section>

      {/* ===== DoctoRed Section ===== */}
      <section id="doctored" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg" style={{ background: '#1a73e8' }}>DR</div>
              <div className="text-left">
                <h2 className="text-3xl font-bold">DoctoRed</h2>
                <p className="text-sm italic text-muted-foreground">"Juro vivira lo grande"</p>
              </div>
            </div>
            <p className="mx-auto max-w-2xl text-muted-foreground">Cobertura médica de calidad con planes flexibles para cada necesidad. Sin copagos en consultas, urgencias, laboratorio e imágenes.</p>
          </div>

          {/* Planes */}
          <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DOCTORED_PLANS.map((plan) => (
              <Card key={plan.name} className="border-2 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: '#1a73e840' }}>
                <CardContent className="p-6">
                  <div className="mb-3 inline-block rounded-lg px-3 py-1 text-sm font-bold text-white" style={{ background: '#1a73e8' }}>{plan.name}</div>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Beneficios */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCTORED_BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3 rounded-lg border p-3" style={{ background: '#e8f0fe' }}>
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#1a73e8' }} />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Premedic Section ===== */}
      <section id="premedic" className="py-20" style={{ background: '#e8f5e9' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg" style={{ background: '#2e7d32' }}>GP</div>
              <div className="text-left">
                <h2 className="text-3xl font-bold">Grupo Premedic</h2>
                <p className="text-sm italic text-muted-foreground">"Somos el respaldo que te merecés"</p>
              </div>
            </div>
            <p className="mx-auto max-w-2xl text-muted-foreground">El respaldo que te merecés con la mejor cobertura y amplia red médica. Telemedicina, médico IA 24/7 y beneficios únicos.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PREMEDIC_BENEFITS.map((b) => (
              <Card key={b.text} className="transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#2e7d3215' }}>
                    <b.icon className="h-6 w-6" style={{ color: '#2e7d32' }} />
                  </div>
                  <span className="text-sm font-medium">{b.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-3 p-4"><Phone className="h-5 w-5 text-red-500" /><div><p className="text-xs text-muted-foreground">Urgencias</p><p className="font-semibold">0810-888-3226</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><Phone className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">Atención al cliente</p><p className="font-semibold">0810-222-5522</p></div></CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4"><Plane className="h-5 w-5 text-green-500" /><div><p className="text-xs text-muted-foreground">Asistencia al viajero</p><p className="font-semibold">0810-666-7676</p></div></CardContent></Card>
          </div>
        </div>
      </section>

      {/* ===== Cartilla Médica Unificada ===== */}
      <section id="cartilla" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3">Cartilla</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">📍 Cartilla Médica</h2>
            <p className="mt-3 text-muted-foreground">Buscá prestadores de DoctoRed o Grupo Premedic en tu zona</p>
          </div>

          {/* Empresa selector tabs */}
          <div className="mb-6 flex justify-center gap-2">
            <button
              onClick={() => { setCartEmpresa('doctored'); setCartResults([]); }}
              className={`rounded-lg px-6 py-2 text-sm font-medium transition ${cartEmpresa === 'doctored' ? 'text-white' : 'border bg-background hover:bg-muted'}`}
              style={cartEmpresa === 'doctored' ? { background: '#1a73e8' } : {}}
            >
              DoctoRed
            </button>
            <button
              onClick={() => { setCartEmpresa('premedic'); setCartResults([]); }}
              className={`rounded-lg px-6 py-2 text-sm font-medium transition ${cartEmpresa === 'premedic' ? 'text-white' : 'border bg-background hover:bg-muted'}`}
              style={cartEmpresa === 'premedic' ? { background: '#2e7d32' } : {}}
            >
              Grupo Premedic
            </button>
          </div>

          {/* Formulario de búsqueda */}
          <div className="mx-auto mb-6 max-w-3xl rounded-xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cartEmpresa === 'doctored' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Plan *</label>
                    <select value={cartPlan} onChange={(e) => setCartPlan(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      <option value="500">Plan 500</option>
                      <option value="1000">Plan 1000</option>
                      <option value="2000">Plan 2000</option>
                      <option value="3000">Plan 3000</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Provincia *</label>
                    <select value={cartProvincia} onChange={(e) => { setCartProvincia(e.target.value); setCartLocalidad(''); }} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Especialidad</label>
                    <select value={cartEspecialidad} onChange={(e) => setCartEspecialidad(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="TODAS">TODAS</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Dermatología">Dermatología</option>
                      <option value="Pediatría">Pediatría</option>
                      <option value="Ginecología">Ginecología</option>
                      <option value="Traumatología">Traumatología</option>
                      <option value="Clínica Médica">Clínica Médica</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Localidad *</label>
                    <input type="text" value={cartLocalidad} onChange={(e) => setCartLocalidad(e.target.value)} placeholder="Ej: Palermo..." className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Localidad</label>
                    <input type="text" value={cartLocalidad} onChange={(e) => setCartLocalidad(e.target.value)} placeholder="Ej: CABA..." className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Plan Médico</label>
                    <select value={cartPlan} onChange={(e) => setCartPlan(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      <option value="SMG40">SMG40</option>
                      <option value="SMG20">SMG20</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Prestaciones</label>
                    <select value={cartEspecialidad} onChange={(e) => setCartEspecialidad(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      <option value="">Seleccionar...</option>
                      <option value="consultas">Consultas</option>
                      <option value="urgencias">Urgencias</option>
                      <option value="laboratorio">Laboratorio</option>
                      <option value="imagenes">Imágenes</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <Button onClick={handleCartSearch} disabled={cartLoading || (!cartProvincia && !cartLocalidad)} className="mt-4 w-full gap-2" size="lg"
              style={{ background: cartEmpresa === 'doctored' ? '#1a73e8' : '#2e7d32' }}>
              {cartLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              Buscar prestadores
            </Button>
          </div>

          {/* Resultados + Mapa */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Lista de resultados */}
            <div className="max-h-[500px] space-y-3 overflow-y-auto">
              {cartResults.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-12 w-12 opacity-30" />
                  <p>Completá los campos y hacé clic en "Buscar prestadores"</p>
                </div>
              ) : (
                cartResults
                  .filter((item) => item.empresa === cartEmpresa)
                  .map((item) => (
                    <Card key={item.id} className="transition hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" style={{ color: cartEmpresa === 'doctored' ? '#1a73e8' : '#2e7d32' }} />
                          <h4 className="font-semibold">{item.nombre}</h4>
                        </div>
                        <p className="ml-6 text-sm text-muted-foreground">{item.direccion}</p>
                        <div className="ml-6 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>📞 {item.telefono}</span>
                          <span>📍 {item.distancia} km</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* Mapa */}
            <div className="h-[500px] overflow-hidden rounded-xl border">
              {cartMounted && cartResults.filter((r) => r.empresa === cartEmpresa).length > 0 ? (
                <iframe
                  title="Mapa de prestadores"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lng - 0.05}%2C${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lat - 0.05}%2C${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lng + 0.05}%2C${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lat + 0.05}&layer=mapnik&marker=${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lat}%2C${cartResults.filter((r) => r.empresa === cartEmpresa)[0].lng}`}
                  className="h-full w-full"
                  style={{ border: 0 }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-12 w-12 opacity-30" />
                    <p className="text-sm">El mapa aparecerá después de buscar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contacto ===== */}
      <section id="contacto" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3">Contacto</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Solicitar Asesoramiento</h2>
            <p className="mt-3 text-muted-foreground">Completá el formulario o contactame directamente</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-stretch">
            {/* IZQUIERDA - Medios de contacto */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📞 Contactame directamente</h3>

              <a href="https://wa.me/5491165555534" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border p-4 transition hover:shadow-md">
                <span className="text-2xl">💬</span>
                <div><p className="font-medium">WhatsApp Directo</p><p className="text-sm text-primary">11-6555-5534</p></div>
              </a>

              <a href="mailto:acandia@mphominis.com.ar" className="flex items-center gap-3 rounded-lg border p-4 transition hover:shadow-md">
                <span className="text-2xl">✉️</span>
                <div><p className="font-medium">Email</p><p className="text-sm text-primary">acandia@mphominis.com.ar</p></div>
              </a>

              <a href="https://instagram.com/hominisok" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border p-4 transition hover:shadow-md">
                <span className="text-2xl">📸</span>
                <div><p className="font-medium">Instagram</p><p className="text-sm text-primary">@hominisok</p></div>
              </a>

              <a href="https://facebook.com/hominisok" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border p-4 transition hover:shadow-md">
                <span className="text-2xl">📘</span>
                <div><p className="font-medium">Facebook</p><p className="text-sm text-primary">Hominis</p></div>
              </a>

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium">Código QR</p>
                  <p className="text-sm text-muted-foreground">Escaneá y escribile a Agustina</p>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://wa.me/5491165555534"
                    alt="QR WhatsApp"
                    className="mt-1 h-20 w-20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* DERECHA - Formulario */}
            <div>
              <h3 className="mb-4 text-xl font-semibold">📝 Solicitar Asesoramiento</h3>
              <Card className="h-full shadow-xl">
                <CardContent className="flex h-full flex-col p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label>Nombre completo *</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Juan Pérez" /></div>
                      <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="juan@email.com" /></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label>Teléfono *</Label><Input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required placeholder="11-5555-1234" /></div>
                      <div className="space-y-1.5">
                        <Label>Empresa de interés *</Label>
                        <Select value={form.empresaId} onValueChange={(v) => setForm({ ...form, empresaId: v })}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emp_doctored_001">DoctoRed</SelectItem>
                            <SelectItem value="emp_premedic_001">Grupo Premedic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {form.empresaId === 'emp_doctored_001' && (
                      <div className="space-y-1.5">
                        <Label>Plan de interés</Label>
                        <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                          <SelectTrigger><SelectValue placeholder="Seleccionar plan..." /></SelectTrigger>
                          <SelectContent>{DOCTORED_PLANS.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1.5"><Label>Mensaje (opcional)</Label><Textarea rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} placeholder="Contanos qué necesitás..." /></div>
                    <Button type="submit" disabled={loading} className="w-full gap-2" size="lg" style={{ background: 'linear-gradient(to right, #1a73e8, #2e7d32)' }}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Enviar solicitud <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">🔒 Tus datos están protegidos. No compartimos tu información.</p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2 flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" /> Seguros de Salud — Asesoría de DoctoRed y Grupo Premedic
          </p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}





