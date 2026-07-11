'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, TrendingUp, Users, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'sales' | 'performance';

export default function ReportesPage() {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [start, setStart] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [end, setEnd] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportType}?start=${start}&end=${end}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, start, end]);

  useEffect(() => { load(); }, [load]);

  const downloadExcel = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/reports/sales?start=${start}&end=${end}&format=excel`);
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_ventas_${start}_a_${end}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Excel descargado');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📊 Reportes Avanzados</h1>
        <p className="text-sm text-muted-foreground">Analizá el rendimiento del equipo y las ventas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end p-4">
          <div className="space-y-1.5">
            <Label>Desde</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hasta</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="flex gap-1">
              <Button size="sm" variant={reportType === 'sales' ? 'default' : 'outline'} onClick={() => setReportType('sales')}>Ventas</Button>
              <Button size="sm" variant={reportType === 'performance' ? 'default' : 'outline'} onClick={() => setReportType('performance')}>Rendimiento</Button>
            </div>
          </div>
          {reportType === 'sales' && (
            <Button onClick={downloadExcel} disabled={downloading} className="gap-1.5 ml-auto">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar Excel
            </Button>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : !data ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Sin datos para el período seleccionado.</CardContent></Card>
      ) : reportType === 'sales' ? (
        <SalesReportView data={data} />
      ) : (
        <PerformanceReportView data={data} />
      )}
    </div>
  );
}

function SalesReportView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Leads totales" value={data.totalLeads} icon={<FileText className="h-5 w-5" />} />
        <StatCard title="Conversiones" value={data.conversions} icon={<Award className="h-5 w-5" />} />
        <StatCard title="Tasa conversión" value={`${data.conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By vendor */}
        <Card>
          <CardHeader><CardTitle className="text-base">Por vendedor</CardTitle></CardHeader>
          <CardContent>
            {data.byVendor.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p> : (
              <div className="space-y-2">
                {data.byVendor.map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm font-medium">{v.name}</span>
                    <div className="text-right text-sm">
                      <span className="font-bold">{v.leads}</span> leads · <span className="text-green-600">{v.conversions}</span> conv · <span className="font-bold">{v.conversionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By source */}
        <Card>
          <CardHeader><CardTitle className="text-base">Por fuente</CardTitle></CardHeader>
          <CardContent>
            {data.bySource.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Sin datos</p> : (
              <div className="space-y-2">
                {data.bySource.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-sm font-bold">{s.leads} leads</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By status */}
        <Card>
          <CardHeader><CardTitle className="text-base">Por estado</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.byStatus).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between p-2 rounded-lg border">
                  <Badge variant="outline">{status}</Badge>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By segment */}
        <Card>
          <CardHeader><CardTitle className="text-base">Por segmento</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.bySegment).map(([seg, count]: [string, any]) => (
                <div key={seg} className="flex items-center justify-between p-2 rounded-lg border">
                  <span className="text-sm">{seg.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PerformanceReportView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Rendimiento por vendedor ({data.dateRange?.start} → {data.dateRange?.end})</CardTitle></CardHeader>
        <CardContent>
          {data.vendors.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Sin vendedores activos.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Vendedor</th>
                    <th className="py-2 px-4">Rol</th>
                    <th className="py-2 px-4 text-right">Total</th>
                    <th className="py-2 px-4 text-right">Nuevos</th>
                    <th className="py-2 px-4 text-right">En contacto</th>
                    <th className="py-2 px-4 text-right">Reuniones</th>
                    <th className="py-2 px-4 text-right">Presup.</th>
                    <th className="py-2 px-4 text-right text-green-600">Cerrados</th>
                    <th className="py-2 px-4 text-right text-red-600">Rechaz.</th>
                    <th className="py-2 px-4 text-right">Conv.</th>
                    <th className="py-2 pl-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vendors.map((v: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-accent/50">
                      <td className="py-2 pr-4 font-medium">{v.nombre} {v.apellido || ''}</td>
                      <td className="py-2 px-4"><Badge variant="outline" className="text-[10px]">{v.rol}</Badge></td>
                      <td className="py-2 px-4 text-right font-bold">{Number(v.totalContacts)}</td>
                      <td className="py-2 px-4 text-right">{Number(v.nuevos)}</td>
                      <td className="py-2 px-4 text-right">{Number(v.enContacto)}</td>
                      <td className="py-2 px-4 text-right">{Number(v.reuniones)}</td>
                      <td className="py-2 px-4 text-right">{Number(v.presupuestos)}</td>
                      <td className="py-2 px-4 text-right text-green-600 font-medium">{Number(v.conversions)}</td>
                      <td className="py-2 px-4 text-right text-red-600">{Number(v.rechazados)}</td>
                      <td className="py-2 px-4 text-right font-bold">{v.conversionRate}%</td>
                      <td className="py-2 pl-4 text-right">{v.avgScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
