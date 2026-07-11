'use client';
import { useTranslation } from '@/components/language-selector';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const VendedoresMap = dynamic(() => import('@/components/dashboard/VendedoresMap').then(m => ({ default: m.VendedoresMap })), {
  ssr: false,
  loading: () => <div className="h-[600px] rounded-lg border bg-muted/30 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>,
});

export default function AdminMapaPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.mapa.title')}</h1>
        <p className="text-sm text-muted-foreground">Todos los vendedores con su radio de cobertura + todos los contactos del CRM</p>
      </div>
      <VendedoresMap contactLinkBase="/admin/contactos" height="600px" />
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Vista de administrador: todos los vendedores (azules) y productores (violetas) con sus áreas de cobertura, más todos los contactos (rosa) geolocalizados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
