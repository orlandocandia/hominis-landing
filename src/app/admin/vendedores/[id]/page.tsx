'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, Mail, Phone, Building2, Edit3, ListTodo, ClipboardList, User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface Vendedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  avatarUrl: string | null;
  activo: number | boolean;
  rol: string;
  empresaNombre: string | null;
  fechaAlta: string | null;
  totalLeads: number;
  leadsAtendidos: number;
  tareasPendientes: number;
  tareasCompletadas: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'No disponible';
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return 'No disponible'; }
}

export default function VendedorDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/users/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setVendedor(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error || !vendedor) {
    return (
      <div className="py-12 text-center">
        <UserIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Vendedor no encontrado</h2>
        <p className="mt-2 text-muted-foreground">El vendedor que buscas no existe o fue eliminado</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const isActive = Boolean(vendedor.activo);
  const initials = vendedor.nombre?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{vendedor.nombre}</h1>
          <p className="text-sm text-muted-foreground">Detalle del vendedor</p>
        </div>
      </div>

      {/* Info principal */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{vendedor.nombre}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <Badge
                  variant="secondary"
                  className={
                    isActive
                      ? 'border-transparent bg-emerald-500/15 text-emerald-600'
                      : 'text-zinc-500'
                  }
                >
                  {isActive ? '🟢 Activo' : '🔴 Inactivo'}
                </Badge>
                <span className="text-sm text-muted-foreground">{vendedor.rol}</span>
              </div>
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{vendedor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{vendedor.telefono || 'No especificado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{vendedor.empresaNombre || 'Sin empresa'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de alta</p>
                <p className="font-medium">{formatDate(vendedor.fechaAlta)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vendedor.totalLeads || 0}</p>
            <p className="text-sm text-muted-foreground">Leads asignados</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{vendedor.leadsAtendidos || 0}</p>
            <p className="text-sm text-muted-foreground">Leads atendidos</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{vendedor.tareasPendientes || 0}</p>
            <p className="text-sm text-muted-foreground">Tareas pendientes</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{vendedor.tareasCompletadas || 0}</p>
            <p className="text-sm text-muted-foreground">Tareas completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">⚡ Acciones rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/admin/tareas?asignadoA=${vendedor.id}`}>
                <ListTodo className="h-4 w-4" /> Ver tareas
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/admin/leads?ownerId=${vendedor.id}`}>
                <ClipboardList className="h-4 w-4" /> Ver leads
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/admin/vendedores">
                <Edit3 className="h-4 w-4" /> Editar vendedor
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
