'use client';

import { useTranslation } from '@/components/language-selector';

/**
 * Client component that translates dashboard titles + labels.
 * Server components can't use useTranslation (it's a client context),
 * so this wrapper provides translated strings as props.
 */
export function DashboardTitle({ role, name }: { role: string; name?: string }) {
  const { t } = useTranslation();
  const isProductor = role === 'PRODUCTOR';
  const isAdmin = role === 'ADMIN';

  const title = isAdmin
    ? t('dashboard.title') || 'Panel de Administración'
    : isProductor
      ? t('dashboard.productor_title') || 'Panel de Productor'
      : t('dashboard.vendedor_title') || 'Panel de Vendedor';

  const welcome = `${t('dashboard.welcome') || 'Bienvenida/o'}, ${name || ''}`.trim();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{welcome}</p>
    </div>
  );
}

export function StatCardLabel({ labelKey }: { labelKey: string }) {
  const { t } = useTranslation();
  return <>{t(labelKey)}</>;
}
