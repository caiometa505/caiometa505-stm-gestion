import { useEffect, useState } from 'react'
import { Activity, Package, ShieldCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStore } from '@/hooks/use-store'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function Dashboard() {
  const { selectedStoreId } = useStore()

  const [stats, setStats] = useState({
    receptions: 0,
    warranties: 0,
    claims: 0,
    alerts: 0,
  })

  const [activities, setActivities] = useState<any[]>([])

  const loadData = async () => {
    if (!selectedStoreId) return

    try {
      const [rec, war, cla, act] = await Promise.all([
        pb
          .collection('receptions')
          .getList(1, 1, { filter: `store_id = "${selectedStoreId}" && status = "Pendiente"` }),
        pb
          .collection('warranties')
          .getList(1, 1, { filter: `store_id = "${selectedStoreId}" && status = "En Proceso"` }),
        pb
          .collection('claims')
          .getList(1, 1, { filter: `store_id = "${selectedStoreId}" && status != "Resuelta"` }),
        pb
          .collection('activities')
          .getList(1, 5, { filter: `store_id = "${selectedStoreId}"`, sort: '-created' }),
      ])

      setStats({
        receptions: rec.totalItems,
        warranties: war.totalItems,
        claims: cla.totalItems,
        alerts: Math.floor(Math.random() * 3), // Mock alerts
      })
      setActivities(act.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStoreId])

  useRealtime('activities', () => {
    loadData()
  })
  useRealtime('receptions', () => {
    loadData()
  })
  useRealtime('warranties', () => {
    loadData()
  })
  useRealtime('claims', () => {
    loadData()
  })

  if (!selectedStoreId)
    return <div className="text-center py-10">Selecciona una tienda para ver su dashboard.</div>

  const statCards = [
    {
      title: 'Recepciones hoy',
      value: stats.receptions,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Garantías pendientes',
      value: stats.warranties,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Reclamaciones abiertas',
      value: stats.claims,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Alertas de OCR',
      value: stats.alerts,
      icon: Activity,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Escritorio</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="shadow-sm border-slate-200 hover:-translate-y-1 transition-transform duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {activities.length === 0 && (
                <p className="text-sm text-slate-500">No hay actividad reciente.</p>
              )}
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-4">
                  <div className="mt-0.5 p-2 rounded-full bg-slate-100">
                    <Activity className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{act.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(act.created).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Package className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-slate-100">Resumen Operativo</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-slate-300 text-sm leading-relaxed">
              La tienda actual se encuentra operando con normalidad. No se detectan cuellos de
              botella críticos en recepción. Las garantías están siendo procesadas en el tiempo
              estimado.
            </p>
            <div className="mt-6 flex gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-slate-400">Eficiencia</div>
                <div className="text-xl font-bold text-emerald-400">94%</div>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-slate-400">SLA Medio</div>
                <div className="text-xl font-bold text-blue-400">2.4 hrs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
