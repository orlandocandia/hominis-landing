// GET /api/i18n/[locale] — returns translation JSON for the requested locale
import { NextResponse } from 'next/server';

const TRANSLATIONS: Record<string, any> = {
  es: {
    landing: {
      title: 'Tu bienestar, mi compromiso',
      subtitle: 'Asesoría personalizada en planes de salud Hominis',
      cta: 'Solicitar Asesoramiento',
      nav: { home: 'Inicio', about: 'Sobre Mí', plans: 'Planes', promotions: 'Promociones', services: 'Servicios', branch: 'Sucursal', contact: 'Contacto' },
    },
    theme: { light: 'Claro', dark: 'Oscuro', system: 'Sistema' },
    language: { select: 'Idioma', es: 'Español', en: 'English', pt: 'Portugués' },
  },
  en: {
    landing: {
      title: 'Your well-being, my commitment',
      subtitle: 'Personalized advice on Hominis health plans',
      cta: 'Request Consultation',
      nav: { home: 'Home', about: 'About Me', plans: 'Plans', promotions: 'Promotions', services: 'Services', branch: 'Branch', contact: 'Contact' },
    },
    theme: { light: 'Light', dark: 'Dark', system: 'System' },
    language: { select: 'Language', es: 'Español', en: 'English', pt: 'Português' },
  },
  pt: {
    landing: {
      title: 'Seu bem-estar, meu compromisso',
      subtitle: 'Aconselhamento personalizado em planos de saúde Hominis',
      cta: 'Solicitar Assessoria',
      nav: { home: 'Início', about: 'Sobre Mim', plans: 'Planos', promotions: 'Promoções', services: 'Serviços', branch: 'Agência', contact: 'Contato' },
    },
    theme: { light: 'Claro', dark: 'Escuro', system: 'Sistema' },
    language: { select: 'Idioma', es: 'Español', en: 'English', pt: 'Português' },
  },
};

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const translations = TRANSLATIONS[locale] || TRANSLATIONS.es;
  return NextResponse.json(translations);
}
