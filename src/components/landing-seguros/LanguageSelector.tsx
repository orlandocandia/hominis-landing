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

const LABELS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

const SHORT: Record<string, string> = {
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
        {(['es', 'en', 'pt'] as const).map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => changeLocale(l)}
            className={locale === l ? 'font-bold' : ''}
          >
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
