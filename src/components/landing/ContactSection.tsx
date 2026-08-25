'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Mail, Instagram, Facebook, Send } from 'lucide-react';
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
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '@/components/language-selector';
import { AnimatedSection } from '@/components/landing/AnimatedSection';

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

/* ─── SUCURSAL / OFICINA SECTION ─── */
/* ─── CONTACT FORM SECTION ─── */
export function ContactSection() {
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
          origen: 'landing-hominis',
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
                    <Label htmlFor="segmento" className="text-sm font-medium">{t('landing.contact.situation')}</Label>
                    <Select
                      value={formData.segmento}
                      onValueChange={(val) =>
                        setFormData((p) => ({ ...p, segmento: val }))
                      }
                      required
                    >
                      <SelectTrigger id="segmento" className="w-full rounded-xl h-12 data-[size=default]:h-12">
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
                  <Label htmlFor="cobertura" className="text-sm font-medium">
                    {t('landing.contact.coverage')}
                  </Label>
                  <Select
                    value={formData.cobertura}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, cobertura: val }))
                    }
                  >
                    <SelectTrigger id="cobertura" className="w-full rounded-xl h-12 data-[size=default]:h-12">
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
