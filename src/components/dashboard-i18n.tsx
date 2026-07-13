'use client';

import { useTranslation } from '@/components/language-selector';

export function DashboardTitle({ role }: { role: string }) {
  const { t } = useTranslation();
  const isAdmin = role === 'ADMIN';
  const label = isAdmin
    ? (t('dashboard.title') || 'Panel Admin')
    : (t('dashboard.vendedor_title') || 'Panel Vendedor');
  return <span className="block text-[11px] text-muted-foreground">{label}</span>;
}
