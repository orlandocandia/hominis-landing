'use client'

import { useState, useEffect } from 'react'
import { ListTodo, ClipboardList, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function VendedorDashboard() {
  const [stats, setStats] = useState({ tareasPendientes: 0, tareasTotal: 0, leadsTotal: 0, leadsNuevos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vendedor/stats').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setStats(data)
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { title: 'Tareas pendientes', value: stats.tareasPendientes, icon: ListTodo, color: 'text-amber-600 bg-amber-500/15' },
    { title: 'Tareas totales', value: stats.tareasTotal, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/15' },
    { title: 'Leads asignados', value: stats.leadsTotal, icon: ClipboardList, color: 'text-violet-600 bg-violet-500/15' },
    { title: 'Leads nuevos', value: stats.leadsNuevos, icon: TrendingUp, color: 'text-sky-600 bg-sky-500/15' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mi Panel</h1>
      <p className="text-sm text-muted-foreground mb-6">Resumen de tu actividad</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon
          return (
            <Card key={i}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-3xl font-bold mt-1">{loading ? '...' : c.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}><Icon className="h-6 w-6" /></div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
