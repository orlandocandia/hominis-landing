'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  Users,
  ClipboardList,
  ListTodo,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  Bell,
  ShieldCheck,
  LogOut,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notification-bell'
import { toast } from 'sonner'

interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  origen: string
  estado: string
  createdAt: string
}

interface Stats {
  totalVendedores: number
  totalLeads: number
  totalTareas: number
}

function StatCard({ title, value, icon, accent }: {
  title: string
  value: number
  icon: React.ReactNode
  accent: 'emerald' | 'violet' | 'amber'
}) {
  const colors = {
    emerald: 'border-emerald-200/60 bg-emerald-50/50 text-emerald-600',
    violet: 'border-violet-200/60 bg-violet-50/50 text-violet-600',
    amber: 'border-amber-200/60 bg-amber-50/50 text-amber-600',
  }
  return (
    <Card className={`border ${colors[accent]}`}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${colors[accent].split(' ').pop()}`}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[accent]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<Stats>({ totalVendedores: 0, totalLeads: 0, totalTareas: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [statsRes] = await Promise.all([
        fetch('/api/admin/stats/equipo', { cache: 'no-store' }),
      ])
      if (statsRes.ok) {
        setStats(await statsRes.json())
      }
      // Fetch recent leads from Contacto table
      // Using the notifications API as a proxy for "recent activity"
      if (isRefresh) toast.success('Datos actualizados')
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [fetchData, status])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login'
    }
  }, [status])

  const userName = session?.user?.name || 'Usuario'
  const initials = userName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-foreground">Hominis CRM</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Panel de Gestión</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <div className="ml-1 hidden h-6 w-px bg-border sm:block" />
            <Avatar className="ml-1 h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Title */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">👥</span>
              Panel de Control
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenido, <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard title="Vendedores" value={stats.totalVendedores} accent="emerald" icon={<Users className="h-6 w-6" />} />
            <StatCard title="Leads totales" value={stats.totalLeads} accent="violet" icon={<ClipboardList className="h-6 w-6" />} />
            <StatCard title="Tareas pendientes" value={stats.totalTareas} accent="amber" icon={<ListTodo className="h-6 w-6" />} />
          </div>
        )}

        {/* Recent Leads */}
        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-5xl">📋</p>
            <p className="text-muted-foreground">
              Los leads se muestran en las notificaciones de la campana 🔔
            </p>
            <p className="text-xs text-muted-foreground">
              Cada vez que alguien completa un formulario en Hominis o Cotiza, recibís una notificación aquí.
            </p>
          </CardContent>
        </Card>

        {/* Quick activity strip */}
        {!loading && stats.totalLeads > 0 && (
          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Notificaciones en tiempo real
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tocá la campana arriba para ver los leads recibidos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {stats.totalLeads} leads
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-4 w-4 text-violet-500" />
                  {stats.totalVendedores} vendedores
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-4 w-4 text-amber-500" />
                  {stats.totalTareas} tareas
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Hominis CRM — Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sistema activo
          </p>
        </div>
      </footer>
    </div>
  )
}
