'use client';

import { useState } from 'react';
import {
  Shield, CheckCircle2, Phone, Mail, MapPin, Stethoscope, Heart, Pill,
  Syringe, PawPrint, Plane, Smartphone, Building2, ArrowRight, Star,
  Loader2, Globe,
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

const NONE = '__none__';

const DOCTORED_PLANS = [
  { name: 'Plan500', desc: 'Con tus aportes. Cobertura médica de calidad sin cuota mensual.', color: 'border-blue-200 bg-blue-50/50' },
  { name: 'Plan1000', desc: 'Tu primer plan privado. Cobertura completa y excelente cartilla médica.', color: 'border-sky-200 bg-sky-50/50' },
  { name: 'Plan2000', desc: 'Más cobertura y comodidad. Mayor nivel de prestaciones.', color: 'border-indigo-200 bg-indigo-50/50' },
  { name: 'Plan3000', desc: 'Cobertura total sin límites. El plan más completo.', color: 'border-violet-200 bg-violet-50/50' },
];

const DOCTORED_BENEFITS = [
  { icon: CheckCircle2, text: 'Sin copagos en consultas, urgencias, laboratorio e imágenes' },
  { icon: Stethoscope, text: 'Prestadores de calidad' },
  { icon: Heart, text: 'Atención personalizada' },
  { icon: Smartphone, text: 'App para gestionar tu cobertura' },
  { icon: MapPin, text: 'Red médica en todo el país' },
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
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', empresaId: '', plan: '', mensaje: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.telefono || !form.empresaId) {
      toast.error('Nombre, email, teléfono y empresa son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          segmento: 'PARTICULAR',
          mensaje: `Empresa: ${form.empresaId === 'emp_doctored_001' ? 'DoctoRed' : 'Grupo Premedic'} | Plan: ${form.plan || 'No especificado'} | ${form.mensaje}`,
          cobertura: 'CABA',
          empresaId: form.empresaId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('¡Solicitud enviada! Te contactaremos a la brevedad.');
      setForm({ nombre: '', email: '', telefono: '', empresaId: '', plan: '', mensaje: '' });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Seguros de Salud</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700 py-24 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)' }} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <Badge className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-wider">
            <Shield className="mr-1.5 h-3.5 w-3.5" /> Asesoría sin costo
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Encontrá el plan de salud<br />que mejor se adapta a vos
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80 sm:text-xl">
            Compará las mejores opciones de DoctoRed y Grupo Premedic con asesoría personalizada y sin costo.
          </p>
          <a href="#contacto">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8 shadow-2xl text-base">
              Solicitar Asesoramiento <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Company Cards */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Nuestras Empresas</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {/* DoctoRed */}
            <Card className="overflow-hidden border-2 transition-all hover:shadow-xl" style={{ borderColor: '#1a73e8' }}>
              <div className="h-2" style={{ background: '#1a73e8' }} />
              <CardContent className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white" style={{ background: '#1a73e8' }}>
                    DR
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">DoctoRed</h3>
                    <p className="text-sm text-muted-foreground italic">"Juro vivira lo grande"</p>
                  </div>
                </div>
                <p className="text-muted-foreground">Cobertura médica de calidad con planes flexibles para cada necesidad.</p>
              </CardContent>
            </Card>

            {/* Grupo Premedic */}
            <Card className="overflow-hidden border-2 transition-all hover:shadow-xl" style={{ borderColor: '#0056a4' }}>
              <div className="h-2" style={{ background: '#0056a4' }} />
              <CardContent className="p-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white" style={{ background: '#0056a4' }}>
                    GP
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Grupo Premedic</h3>
                    <p className="text-sm text-muted-foreground italic">"Somos el respaldo que te merecés"</p>
                  </div>
                </div>
                <p className="text-muted-foreground">El respaldo que te merecés con la mejor cobertura y amplia red médica.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* DoctoRed Plans */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4" style={{ background: '#1a73e8', color: 'white' }}>DoctoRed</Badge>
            <h2 className="text-3xl font-bold">Planes DoctoRed</h2>
            <p className="mt-2 text-muted-foreground">Elegí el plan que se adapte a tu presupuesto</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DOCTORED_PLANS.map((plan) => (
              <Card key={plan.name} className={`border-2 ${plan.color} transition-all hover:-translate-y-1 hover:shadow-lg`}>
                <CardContent className="p-6">
                  <h3 className="mb-3 text-xl font-bold" style={{ color: '#1a73e8' }}>{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCTORED_BENEFITS.map((b) => (
              <div key={b.text} className="flex items-center gap-3 rounded-lg bg-background p-3">
                <b.icon className="h-5 w-5 shrink-0" style={{ color: '#1a73e8' }} />
                <span className="text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grupo Premedic Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge className="mb-4" style={{ background: '#0056a4', color: 'white' }}>Grupo Premedic</Badge>
            <h2 className="text-3xl font-bold">Beneficios Grupo Premedic</h2>
            <p className="mt-2 text-muted-foreground">Todo lo que necesitás para cuidar tu salud y la de tu familia</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PREMEDIC_BENEFITS.map((b) => (
              <Card key={b.text} className="transition-all hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#0056a415' }}>
                    <b.icon className="h-6 w-6" style={{ color: '#0056a4' }} />
                  </div>
                  <span className="text-sm font-medium">{b.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Phone className="h-5 w-5 text-red-500" />
              <div><p className="text-xs text-muted-foreground">Urgencias</p><p className="font-semibold">0810-888-3226</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Phone className="h-5 w-5 text-blue-500" />
              <div><p className="text-xs text-muted-foreground">Atención al cliente</p><p className="font-semibold">0810-222-5522</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Plane className="h-5 w-5 text-green-500" />
              <div><p className="text-xs text-muted-foreground">Asistencia al viajero</p><p className="font-semibold">0810-666-7676</p></div>
            </CardContent></Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacto" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">Solicitar Asesoramiento</h2>
            <p className="mt-2 text-muted-foreground">Completá el formulario y te contactaremos a la brevedad</p>
          </div>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nombre completo *</Label>
                    <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Juan Pérez" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="juan@email.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Teléfono *</Label>
                    <Input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required placeholder="11-5555-1234" />
                  </div>
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
                      <SelectContent>
                        {DOCTORED_PLANS.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Mensaje (opcional)</Label>
                  <Textarea rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} placeholder="Contanos qué necesitás..." />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Enviar solicitud <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  🔒 Tus datos están protegidos. No compartimos tu información.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">Seguros de Salud — Asesoría de DoctoRed y Grupo Premedic</p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
