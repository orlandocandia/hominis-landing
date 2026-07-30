'use client'

import { ChevronDown } from 'lucide-react'
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

const FLAGS: Record<LangCode, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  pt: '🇧🇷',
}

export function LanguageSelector() {
  const { locale, changeLocale } = useTranslation()
  const currentFlag = FLAGS[locale] || '🇪🇸'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Seleccionar idioma"
          className="gap-1 px-2"
        >
          <span className="text-xl leading-none" aria-hidden>
            {currentFlag}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
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
