'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Mail, MapPin, Loader2, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  rol: string;
  activo: number | boolean;
  city: string | null;
  province: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceRadius: number;
  totalContacts: number;
  conversionRate: number;
  fechaAlta: string;
  avatarUrl: string | null;
}

export default function VendedoresListPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'VENDEDOR' | 'PRODUCTOR'>('ALL');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users${filter !== 'ALL' ? `?role=${filter}` : ''}`);
      const data = await res.json();
      setVendors(data.users || []);
    } catch {
      toast.error('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Vendedor eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const initials = (n: string, a: string | null) => ((n[0] || '') + (a?.[0] || '')).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendedores</h1>
          <p className="text-sm text-muted-foreground">{vendors.length} {vendors.length === 1 ? 'usuario' : 'usuarios'} activos</p>
        </div>
        <Button onClick={() => router.push('/admin/vendedores/nuevo')} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo vendedor
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['ALL', 'VENDEDOR', 'PRODUCTOR'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'Todos' : f === 'VENDEDOR' ? 'Vendedores' : 'Productores'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay vendedores cargados todavía.</p>
            <Button onClick={() => router.push('/admin/vendedores/nuevo')} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Crear el primer vendedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {vendors.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-hominis-blue to-hominis-violet text-white font-bold flex-shrink-0 overflow-hidden">
                    {v.avatarUrl ? <img src={v.avatarUrl} alt={v.nombre} className="w-full h-full object-cover" /> : initials(v.nombre, v.apellido)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{v.nombre} {v.apellido || ''}</span>
                      <Badge variant={v.rol === 'PRODUCTOR' ? 'default' : 'secondary'} className="text-[10px] py-0">{v.rol}</Badge>
                      {!v.activo && <Badge variant="destructive" className="text-[10px] py-0">Inactivo</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</span>
                      {v.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{v.city}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold">{v.totalContacts}</p>
                    <p className="text-xs text-muted-foreground">contactos</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-bold flex items-center gap-1 justify-end"><Star className="w-3 h-3 text-amber-500" />{v.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground">conversión</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" asChild className="h-8 w-8 p-0"><Link href={`/admin/vendedores/${v.id}`}><Pencil className="w-3.5 h-3.5" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id, `${v.nombre} ${v.apellido || ''}`)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
