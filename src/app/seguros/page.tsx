'use client';

import { useState } from 'react';
import {
  Shield, CheckCircle2, Phone, Mail, MapPin, Stethoscope, Heart, Pill,
  Syringe, PawPrint, Plane, Smartphone, Building2, ArrowRight, Menu, X,
  ChevronDown, Loader2,
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
  { icon: Plane, text: 'Asistencia al viajero' },
  { icon: Building2, text: 'Centros médicos PMC' },
  { icon: Pill, text: 'Descuentos en Farmacity' },
  { icon: Smartphone, text: 'App Premedic Móvil' },
];

export default function SegurosPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', empresaId: '', plan: '', mensaje: '' });

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
            <a href="#inicio" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Inicio</a>
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                Empresas <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full mt-1 w-56 rounded-xl border bg-card shadow-lg transition group-hover:visible">
                <a href="#doctored" className="block px-4 py-3 text-sm hover:bg-muted rounded-t-xl">
                  <span className="font-semibold" style={{ color: '#1a73e8' }}>DoctoRed</span>
                  <p className="text-xs text-muted-foreground">Planes flexibles sin copagos</p>
                </a>
                <a href="#premedic" className="block px-4 py-3 text-sm hover:bg-muted rounded-b-xl">
                  <span className="font-semibold" style={{ color: '#2e7d32' }}>Grupo Premedic</span>
                  <p className="text-xs text-muted-foreground">Respaldo y amplia red médica</p>
                </a>
              </div>
            </div>
            <div className="group relative">
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                Planes <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-0 top-full mt-1 w-56 rounded-xl border bg-card shadow-lg transition group-hover:visible">
                {DOCTORED_PLANS.map(p => (
                  <a key={p.name} href="#planes" className="block px-4 py-2 text-sm hover:bg-muted first:rounded-t-xl last:rounded-b-xl">
                    <span className="font-semibold" style={{ color: '#1a73e8' }}>{p.name}</span>
                  </a>
                ))}
              </div>
            </div>
            <a href="#contacto" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Contacto</a>
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
            <a href="#inicio" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Inicio</a>
            <a href="#doctored" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>DoctoRed</a>
            <a href="#premedic" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Grupo Premedic</a>
            <a href="#planes" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Planes</a>
            <a href="#contacto" className="block py-2 text-sm" onClick={() => setMobileMenu(false)}>Contacto</a>
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
            Compará DoctoRed y Grupo Premedic con asesoría personalizada y sin costo.
          </p>
          <a href="#contacto">
            <Button size="lg" className="bg-white px-8 text-base font-semibold text-blue-600 shadow-2xl hover:bg-white/90">
              📋 Solicitar Asesoramiento <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* ===== Empresas ===== */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3">Nuestras empresas</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Empresas que representamos</h2>
            <p className="mt-3 text-muted-foreground">Trabajamos con las mejores aseguradoras para darte la cobertura que necesitás</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <Card id="doctored" className="overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: '#1a73e8' }}>
              <div className="h-2" style={{ background: '#1a73e8' }} />
              <CardContent className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg" style={{ background: '#1a73e8' }}>DR</div>
                  <div>
                    <h3 className="text-2xl font-bold">DoctoRed</h3>
                    <p className="text-sm italic text-muted-foreground">"Juro vivira lo grande"</p>
                  </div>
                </div>
                <p className="mb-4 text-muted-foreground">Cobertura médica de calidad con planes flexibles para cada necesidad. Sin copagos en consultas, urgencias, laboratorio e imágenes.</p>
                <a href="#planes"><Button variant="outline" className="w-full gap-2" style={{ borderColor: '#1a73e8', color: '#1a73e8' }}>Ver planes <ArrowRight className="h-4 w-4" /></Button></a>
              </CardContent>
            </Card>

            <Card id="premedic" className="overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: '#2e7d32' }}>
              <div className="h-2" style={{ background: '#2e7d32' }} />
              <CardContent className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg" style={{ background: '#2e7d32' }}>GP</div>
                  <div>
                    <h3 className="text-2xl font-bold">Grupo Premedic</h3>
                    <p className="text-sm italic text-muted-foreground">"Somos el respaldo que te merecés"</p>
                  </div>
                </div>
                <p className="mb-4 text-muted-foreground">El respaldo que te merecés con la mejor cobertura y amplia red médica. Telemedicina, médico IA 24/7 y beneficios únicos.</p>
                <a href="#beneficios"><Button variant="outline" className="w-full gap-2" style={{ borderColor: '#2e7d32', color: '#2e7d32' }}>Ver beneficios <ArrowRight className="h-4 w-4" /></Button></a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== Planes DoctoRed ===== */}
      <section id="planes" className="py-20" style={{ background: '#e8f0fe' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-3 text-white" style={{ background: '#1a73e8' }}>DoctoRed</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Planes DoctoRed</h2>
            <p className="mt-3 text-muted-foreground">Elegí el plan que se adapte a tu presupuesto y necesidades</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DOCTORED_PLANS.map((plan) => (
              <Card key={plan.name} className="border-2 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: '#1a73e840' }}>
                <CardContent className="p-6">
                  <div className="mb-3 inline-block rounded-lg px-3 py-1 text-sm font-bold text-white" style={{ background: '#1a73e8' }}>{plan.name}</div>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCTORED_BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3 rounded-lg bg-background p-3 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#1a73e8' }} />
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Beneficios Premedic ===== */}
      <section id="beneficios" className="py-20" style={{ background: '#e8f5e9' }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-3 text-white" style={{ background: '#2e7d32' }}>Grupo Premedic</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Beneficios Grupo Premedic</h2>
            <p className="mt-3 text-muted-foreground">Todo lo que necesitás para cuidar tu salud y la de tu familia</p>
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

      {/* ===== Formulario ===== */}
      <section id="contacto" className="py-20">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3">Contacto</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">Solicitar Asesoramiento</h2>
            <p className="mt-3 text-muted-foreground">Completá el formulario y te contactaremos a la brevedad</p>
          </div>
          <Card className="shadow-xl">
            <CardContent className="p-6 sm:p-8">
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
