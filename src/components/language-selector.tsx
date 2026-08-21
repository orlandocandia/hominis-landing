'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES = {
  es: { label: 'Español', flag: '🇪🇸' },
  en: { label: 'English', flag: '🇬🇧' },
  pt: { label: 'Português', flag: '🇧🇷' },
} as const;

export type Locale = keyof typeof LANGUAGES;

// ─── Context: holds locale + translations, triggers instant re-render ───
interface I18nContextValue {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'es',
  t: (key: string) => key,
  setLocale: () => {},
});

// All translations loaded upfront synchronously (imported from translations.ts).
// No async fetch needed — translations are bundled at build time.
import { translations as ALL_I18N } from '@/lib/i18n/translations';

const ALL_TRANSLATIONS: Record<Locale, Record<string, any>> = {
  es: ALL_I18N.es,
  en: ALL_I18N.en,
  pt: ALL_I18N.pt,
};

let translationsLoaded = true;

async function loadAllTranslations() {
  // No-op: translations are already imported synchronously.
  translationsLoaded = true;
}

// ─── Provider: wraps the app, holds locale state ───
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [loaded, setLoaded] = useState(translationsLoaded);

  useEffect(() => {
    const saved = (localStorage.getItem('locale') as Locale) || 'es';
    // Use setTimeout to defer state updates outside effect body
    const timer = setTimeout(() => {
      if (saved !== locale) setLocaleState(saved);
      if (!translationsLoaded) {
        loadAllTranslations().then(() => setLoaded(true));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    setLocaleState(newLocale);
  }, []);

  // Translation function — supports flat keys ('landing.hero.title')
  // and nested keys ({landing:{hero:{title}}}).
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const translations = ALL_TRANSLATIONS[locale];
      if (!translations) return key;
      // First try the flat key directly (translations.ts uses flat keys).
      let value: any = translations[key];
      // Fallback to nested lookup (for nested dictionaries).
      if (value === undefined) {
        const keys = key.split('.');
        value = translations as any;
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) break;
        }
      }
      if (typeof value === 'string' && params) {
        return value.replace(/\{(\w+)\}/g, (_, p) => params[p] || '');
      }
      return typeof value === 'string' ? value : key;
    },
    [locale, loaded] // Re-create when locale or loaded changes → triggers re-render
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook: use translation in any client component ───
export function useTranslation() {
  const ctx = useContext(I18nContext);
  return { t: ctx.t, locale: ctx.locale };
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}

// ─── LanguageSelector component ───
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
                onClick={() => {
                  setLocale(code as Locale);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-accent/50 flex items-center gap-2 text-sm ${
                  locale === code ? 'text-primary font-medium' : ''
                }`}
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
