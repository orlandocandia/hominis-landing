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

// All translations loaded upfront (no async per-key fetch)
const ALL_TRANSLATIONS: Record<Locale, Record<string, any>> = {
  es: {},
  en: {},
  pt: {},
};

let translationsLoaded = false;

async function loadAllTranslations() {
  if (translationsLoaded) return;
  try {
    const [es, en, pt] = await Promise.all([
      fetch('/api/i18n/es').then((r) => r.json()),
      fetch('/api/i18n/en').then((r) => r.json()),
      fetch('/api/i18n/pt').then((r) => r.json()),
    ]);
    ALL_TRANSLATIONS.es = es;
    ALL_TRANSLATIONS.en = en;
    ALL_TRANSLATIONS.pt = pt;
    translationsLoaded = true;
  } catch (e) {
    console.error('[i18n] Failed to load translations:', e);
  }
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

  // Translation function — looks up nested keys in the loaded translations
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const translations = ALL_TRANSLATIONS[locale];
      if (!translations) return key;
      const keys = key.split('.');
      let value: any = translations;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
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
