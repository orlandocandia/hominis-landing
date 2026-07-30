'use client'

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  translations,
  DEFAULT_LOCALE,
  type Locale,
  type TranslationDict,
} from '@/lib/i18n/translations'

const STORAGE_KEY = 'hominis-locale'
const VALID: Locale[] = ['es', 'en', 'pt']

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', cb)
  }
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', cb)
    }
  }
}

function getSnapshot(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && VALID.includes(saved as Locale)) {
      return saved as Locale
    }
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE
}

interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
  dict: TranslationDict
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setLocale = useCallback((l: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore
    }
    notify()
  }, [])

  const dict = translations[locale] ?? translations[DEFAULT_LOCALE]

  const t = useCallback(
    (key: string) => dict[key] ?? translations[DEFAULT_LOCALE][key] ?? key,
    [dict]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Fallback durante prerenderizado/SSG si el provider no está disponible
    // Esto evita que el build de Vercel falle con "useI18n must be used within I18nProvider"
    const fallbackT = (key: string) =>
      translations[DEFAULT_LOCALE][key] ?? key
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: fallbackT,
      dict: translations[DEFAULT_LOCALE],
    }
  }
  return ctx
}
