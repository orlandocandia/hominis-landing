'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Mail, Building2, Users, ListTodo, LogOut, Bell } from 'lucide-react'
import { NotificationBell } from '@/components/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: ShieldCheck },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Mail },
  { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/admin'
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Cargando...</div></div>
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-muted/30 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">Hominis CRM</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur h-14 flex items-center justify-between px-4">
          <div className="md:hidden flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Hominis CRM</span>
          </div>
          <div className="md:hidden flex gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <Button variant={active ? 'secondary' : 'ghost'} size="sm" className="px-2">
                    <Icon className="h-4 w-4" />
                  </Button>
                </Link>
              )
            })}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
