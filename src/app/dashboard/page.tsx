'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  ClipboardList,
  ListTodo,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  Bell,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { NotificationBell } from '@/components/notification-bell'
import { useI18n } from '@/lib/i18n/provider'
import { toast } from 'sonner'

interface VendorMetrics {
  contacts: number
  contactsAtendidos: number
  tareasPendientes: number
}

interface Vendor {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  avatarUrl: string | null
  coverageAreas: string | null
  createdAt: string
  _count: VendorMetrics
}

interface EquipoStats {
  totalVendedores: number
  totalLeads: number
  totalTareas: number
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  accent: 'emerald' | 'violet' | 'amber'
}

const ACCENT_STYLES: Record<
  StatCardProps['accent'],
  { box: string; icon: string; value: string }
> = {
  emerald: {
    box: 'border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20',
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    box: 'border-violet-200/60 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    value: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    box: 'border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
  },
}

function StatCard({ title, value, icon, accent }: StatCardProps) {
  const s = ACCENT_STYLES[accent]
  return (
    <Card className={`border ${s.box}`}>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${s.value}`}>{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.icon}`}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

const COVERAGE_LABELS: Record<string, string> = {
  CABA: 'CABA',
  GBA_NORTE: 'GBA Norte',
  GBA_SUR: 'GBA Sur',
  GBA_OESTE: 'GBA Oeste',
  INTERIOR: 'Interior',
}

export default function EquipoPage() {
  const { t, locale } = useI18n()
  const [vendedores, setVendedores] = useState<Vendor[]>([])
  const [stats, setStats] = useState<EquipoStats>({
    totalVendedores: 0,
    totalLeads: 0,
    totalTareas: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true)
      try {
        const [vendedoresRes, statsRes] = await Promise.all([
          fetch('/api/admin/users?role=VENDEDOR', { cache: 'no-store' }),
          fetch('/api/admin/stats/equipo', { cache: 'no-store' }),
        ])

        if (!vendedoresRes.ok || !statsRes.ok) {
          throw new Error('fetch failed')
        }

        const vendedoresData = (await vendedoresRes.json()) as Vendor[]
        const statsData = (await statsRes.json()) as EquipoStats

        setVendedores(vendedoresData)
        setStats(statsData)

        if (isRefresh) {
          toast.success(
            locale === 'pt'
              ? 'Dados atualizados'
              : locale === 'en'
                ? 'Data refreshed'
                : 'Datos actualizados'
          )
        }
      } catch (error) {
        console.error('Error fetching equipo data:', error)
        toast.error(
          locale === 'pt'
            ? 'Erro ao carregar dados'
            : locale === 'en'
              ? 'Error loading data'
              : 'Error al cargar datos'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [locale]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const navItems = [
    { key: 'nav.equipo', active: true },
    { key: 'nav.leads', active: false },
    { key: 'nav.tareas', active: false },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-foreground">
                {t('app.title')}
              </p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {t('app.subtitle')}
              </p>
            </div>
          </div>

          {/* Nav (desktop) */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.key}
                variant={item.active ? 'secondary' : 'ghost'}
                size="sm"
                className="font-medium"
              >
                {t(item.key)}
                {item.active && (
                  <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
            <NotificationBell />
            <div className="ml-1 hidden h-6 w-px bg-border sm:block" />
            <Avatar className="ml-1 h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                OC
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Nav (mobile) */}
        <nav className="flex items-center gap-1 border-t border-border px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <Button
              key={item.key}
              variant={item.active ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 text-xs"
            >
              {t(item.key)}
            </Button>
          ))}
        </nav>
      </header>

      {/* ===== Main ===== */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Title row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
                👥
              </span>
              {t('equipo.title')}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {stats.totalVendedores} {t('equipo.activeVendors')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              {t('common.refresh')}
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a href="#tareas">
                <ListTodo className="mr-2 h-4 w-4" />
                {t('equipo.tasks')} ({stats.totalTareas})
              </a>
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t('equipo.newVendor')}
            </Button>
          </div>
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
            <StatCard
              title={t('equipo.stat.vendors')}
              value={stats.totalVendedores}
              accent="emerald"
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title={t('equipo.stat.leads')}
              value={stats.totalLeads}
              accent="violet"
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <StatCard
              title={t('equipo.stat.tasks')}
              value={stats.totalTareas}
              accent="amber"
              icon={<ListTodo className="h-6 w-6" />}
            />
          </div>
        )}

        {/* Vendor grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : vendedores.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-5xl">👀</p>
              <p className="text-muted-foreground">{t('equipo.empty.title')}</p>
              <Button variant="link" className="text-primary">
                {t('equipo.empty.cta')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendedores.map((v) => {
              const initials =
                v.name
                  ?.split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() ?? '?'
              const areas = v.coverageAreas
                ? (JSON.parse(v.coverageAreas) as string[])
                : []

              return (
                <Card
                  key={v.id}
                  className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-foreground">
                          {v.name ?? '—'}
                        </h3>
                        <p className="truncate text-sm text-muted-foreground">
                          {v.email}
                        </p>
                        <div className="mt-1.5">
                          <Badge
                            variant={v.isActive ? 'default' : 'secondary'}
                            className={
                              v.isActive
                                ? 'border-transparent bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                                : ''
                            }
                          >
                            {v.isActive ? t('equipo.active') : t('equipo.inactive')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Coverage areas */}
                    {areas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {areas.map((a) => (
                          <span
                            key={a}
                            className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {COVERAGE_LABELS[a] ?? a}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          {v._count.contacts}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('equipo.metric.leads')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {v._count.contactsAtendidos}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('equipo.metric.attended')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {v._count.tareasPendientes}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t('equipo.metric.tasks')}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          toast.info(
                            `${t('equipo.action.tasks')} → ${v.name ?? v.email}`
                          )
                        }
                      >
                        <ListTodo className="mr-1.5 h-3.5 w-3.5" />
                        {t('equipo.action.tasks')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          toast.info(
                            `${t('equipo.action.leads')} → ${v.name ?? v.email}`
                          )
                        }
                      >
                        <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                        {t('equipo.action.leads')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast.info(`${t('equipo.action.edit')} → ${v.name ?? v.email}`)
                        }
                      >
                        {t('equipo.action.edit')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick activity strip */}
        {!loading && vendedores.length > 0 && (
          <Card className="mt-6 border-dashed">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {locale === 'pt'
                      ? 'Notificaciones en tiempo real'
                      : locale === 'en'
                        ? 'Real-time notifications'
                        : 'Notificaciones en tiempo real'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {locale === 'pt'
                      ? 'Toque o sino no topo para ver novidades.'
                      : locale === 'en'
                        ? 'Click the bell at the top to see updates.'
                        : 'Tocá la campana arriba para ver novedades.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {stats.totalLeads} {t('nav.leads').toLowerCase()}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-4 w-4 text-violet-500" />
                  {stats.totalVendedores} {t('equipo.stat.vendors').toLowerCase()}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-4 w-4 text-amber-500" />
                  {stats.totalTareas} {t('nav.tareas').toLowerCase()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="mt-auto border-t border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} {t('app.title')} — {t('footer.rights')}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('footer.powered')}
          </p>
        </div>
      </footer>
    </div>
  )
}
