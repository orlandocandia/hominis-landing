'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, Gem, Loader2, Megaphone } from 'lucide-react';

interface Metrics {
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  costPerLead: number;
  roi: number;
  totalCost: number;
  totalRevenue: number;
  unsourced: number;
  avgRevenuePerConversion: number;
  sources: Array<{ id: string; name: string; category: string; leads: number; conversions: number; cost: number; conversionRate: number }>;
  dailyData: Array<{ date: string; leads: number; conversions: number }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  PAID: 'bg-blue-100 text-blue-800',
  ORGANIC: 'bg-green-100 text-green-800',
  SOCIAL: 'bg-pink-100 text-pink-800',
  REFERRAL: 'bg-purple-100 text-purple-800',
  DIRECT: 'bg-gray-100 text-gray-800',
};

export default function MarketingDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/marketing/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch {
      // toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !metrics) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const maxDailyLeads = Math.max(...metrics.dailyData.map((d) => d.leads), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> Dashboard de Marketing
        </h1>
        <p className="text-sm text-muted-foreground">Analytics de fuentes de leads y conversión</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Leads totales" value={metrics.totalLeads.toString()} icon={<Users className="h-5 w-5" />} hint={`${metrics.unsourced} sin source`} />
        <StatCard title="Costo por Lead" value={`$${metrics.costPerLead}`} icon={<DollarSign className="h-5 w-5" />} hint={`Gasto: $${metrics.totalCost}`} />
        <StatCard title="Tasa Conversión" value={`${metrics.conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} hint={`${metrics.totalConversions} conversiones`} />
        <StatCard title="ROI" value={`${metrics.roi}x`} icon={<Gem className="h-5 w-5" />} hint={`Ingresos: $${metrics.totalRevenue}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fuentes de leads</CardTitle></CardHeader>
          <CardContent>
            {metrics.sources.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay datos de fuentes todavía.</p>
            ) : (
              <div className="space-y-3">
                {metrics.sources.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className={`text-[10px] py-0 ${CATEGORY_COLORS[s.category] || ''}`}>{s.category}</Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.leads} leads · {s.conversions} conv. · ${s.cost}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{s.conversionRate}%</p>
                      <p className="text-xs text-muted-foreground">conv.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tendencia diaria (30 días)</CardTitle></CardHeader>
          <CardContent>
            {metrics.dailyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin datos en los últimos 30 días.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-end gap-1 h-32">
                  {metrics.dailyData.slice(-20).map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div
                        className="w-full bg-primary/70 hover:bg-primary rounded-t transition-all"
                        style={{ height: `${(d.leads / maxDailyLeads) * 100}%`, minHeight: d.leads > 0 ? '4px' : '0' }}
                        title={`${d.date}: ${d.leads} leads, ${d.conversions} conv.`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{metrics.dailyData[0]?.date}</span>
                  <span>{metrics.dailyData[metrics.dailyData.length - 1]?.date}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note about UTM tracking */}
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <Megaphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cómo funciona el tracking</p>
            <p>Los UTM params (<code className="text-xs bg-muted px-1 py-0.5 rounded">utm_source</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">utm_medium</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">utm_campaign</code>) se capturan automáticamente cuando un visitante llega a la landing con esos parámetros en la URL.</p>
            <p className="mt-1">Los leads del formulario público guardan el source en el campo <code className="text-xs bg-muted px-1 py-0.5 rounded">origen</code>. Los contactos creados manualmente en el CRM pueden incluir <code className="text-xs bg-muted px-1 py-0.5 rounded">sourceUtmSource</code> en el body del POST.</p>
            <p className="mt-1 text-xs">Ejemplo: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://asesoradesalud.com.ar/?utm_source=google_ads&utm_medium=cpc&utm_campaign=verano</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, hint }: { title: string; value: string; icon: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
