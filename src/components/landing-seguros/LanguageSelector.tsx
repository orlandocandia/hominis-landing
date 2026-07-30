'use client'

import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from './useTranslation'

type LangCode = 'es' | 'en' | 'pt'

const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

const SHORT: Record<LangCode, string> = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
}

export function LanguageSelector() {
  const { locale, changeLocale, t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={t('lang.select')}>
          <Globe className="h-4 w-4" />
          <span className="ml-1 text-xs font-semibold">{SHORT[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLocale(lang.code)}
            className={locale === lang.code ? 'font-bold' : ''}
          >
            <span className="text-xl mr-2" aria-hidden>{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
