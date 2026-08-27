'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Users, Bell, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ leads: 0, vendedores: 0, notificaciones: 0, nuevos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [leadsRes, statsRes, notifsRes] = await Promise.all([
          fetch('/api/admin/leads?limit=1'),
          fetch('/api/admin/stats/equipo'),
          fetch('/api/notifications'),
        ])
        if (leadsRes.ok) {
          const data = await leadsRes.json()
          setStats(s => ({ ...s, leads: data.total || 0 }))
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(s => ({ ...s, vendedores: data.totalVendedores || 0 }))
        }
        if (notifsRes.ok) {
          const data = await notifsRes.json()
          setStats(s => ({ ...s, notificaciones: Array.isArray(data) ? data.length : 0 }))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { title: 'Mensajes totales', value: stats.leads, icon: ClipboardList, color: 'text-violet-600 bg-violet-500/15' },
    { title: 'Vendedores activos', value: stats.vendedores, icon: Users, color: 'text-emerald-600 bg-emerald-500/15' },
    { title: 'Notificaciones', value: stats.notificaciones, icon: Bell, color: 'text-amber-600 bg-amber-500/15' },
    { title: 'Nuevos leads', value: stats.nuevos, icon: TrendingUp, color: 'text-sky-600 bg-sky-500/15' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Resumen general del sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
