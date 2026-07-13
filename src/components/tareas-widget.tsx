'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TIPO_ICONS: Record<string, string> = {
  VISITA: '📍', LLAMADA: '📞', WHATSAPP: '💬', EMAIL: '✉️', REUNION: '🤝', TAREA: '📋',
};

interface Tarea {
  id: string; titulo: string; descripcion: string | null; tipo: string; estado: string;
  fechaLimite: string; fechaCompletada: string | null;
  contactoName: string | null; contactoPhone: string | null;
}

export function TareasWidget() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tareas');
      const data = await res.json();
      setTareas(data.tareas || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completar = async (id: string) => {
    try {
      const res = await fetch(`/api/tareas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'COMPLETADA' }) });
      if (!res.ok) throw new Error('Error');
      toast.success('Tarea completada');
      load();
    } catch { toast.error('Error al completar'); }
  };

  if (loading) return null;

  const pendientes = tareas.filter(t => t.estado !== 'COMPLETADA' && t.estado !== 'CANCELADA');
  const completadas = tareas.filter(t => t.estado === 'COMPLETADA');

  if (tareas.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Mis Tareas
          {pendientes.length > 0 && <Badge variant="default" className="text-[10px] py-0">{pendientes.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendientes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">🎉 ¡Sin tareas pendientes!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendientes.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-start justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{TIPO_ICONS[t.tipo] || '📋'}</span>
                    <span className="text-xs font-medium truncate">{t.titulo}</span>
                  </div>
                  {t.contactoName && <p className="text-[10px] text-muted-foreground mt-0.5">👤 {t.contactoName}</p>}
                  <p className="text-[10px] text-muted-foreground/70">📅 {new Date(t.fechaLimite).toLocaleDateString('es-AR')}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => completar(t.id)} className="h-6 w-6 flex-shrink-0 text-green-600 hover:text-green-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {completadas.length > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-2 text-center">
            ✅ {completadas.length} completadas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
