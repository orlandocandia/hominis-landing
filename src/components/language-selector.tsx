'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = {
  es: { label: 'Español', flag: '🇪🇸' },
  en: { label: 'English', flag: '🇬🇧' },
  pt: { label: 'Português', flag: '🇧🇷' },
};

export type Locale = keyof typeof LANGUAGES;

// Simple client-side i18n: stores locale in localStorage + cookie,
// dispatches a custom event so components can re-render.
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    const saved = (localStorage.getItem('locale') as Locale) || 'es';
    if (saved !== locale) {
      requestAnimationFrame(() => setLocaleState(saved));
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    setLocaleState(newLocale);
    window.dispatchEvent(new CustomEvent('locale-change', { detail: newLocale }));
  }, []);

  return { locale, setLocale };
}

// Translation hook (simple JSON lookup)
const translations: Record<Locale, Record<string, any>> = {
  es: {},
  en: {},
  pt: {},
};

// Load translations dynamically
let translationsLoaded = false;
async function loadTranslations() {
  if (translationsLoaded) return;
  try {
    const [es, en, pt] = await Promise.all([
      fetch('/api/i18n/es').then(r => r.json()),
      fetch('/api/i18n/en').then(r => r.json()),
      fetch('/api/i18n/pt').then(r => r.json()),
    ]);
    translations.es = es;
    translations.en = en;
    translations.pt = pt;
    translationsLoaded = true;
  } catch {}
}

export function useTranslation() {
  const { locale } = useLocale();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadTranslations().then(() => forceUpdate(n => n + 1));
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = translations[locale];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, p) => params[p] || '');
    }
    return value || key;
  }, [locale]);

  return { t, locale };
}

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 h-9">
        <Globe className="w-4 h-4" />
        <span className="text-base leading-none">{LANGUAGES[locale]?.flag}</span>
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => { setLocale(code as Locale); setOpen(false); }}
                className={`w-full text-left px-3 py-2 hover:bg-accent/50 flex items-center gap-2 text-sm ${locale === code ? 'text-primary font-medium' : ''}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {locale === code && <Check className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
