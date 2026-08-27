'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { ShieldCheck, Users, ClipboardList, Bell, LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { NotificationBell } from '@/components/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/admin'
    }
  }, [status])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Cargando...</div></div>
  }
  if (status === 'unauthenticated') return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Hominis CRM</p>
              <p className="text-[11px] text-muted-foreground">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Bienvenido, {session?.user?.name || 'Admin'}</h1>
        <p className="text-sm text-muted-foreground mb-6">Panel de Administración — Hominis CRM</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Leads</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Vendedores</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Notificaciones</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-muted-foreground">Las funcionalidades del dashboard se cargarán próximamente.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Sesión: {session?.user?.email} | Rol: {(session?.user as any)?.role}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
