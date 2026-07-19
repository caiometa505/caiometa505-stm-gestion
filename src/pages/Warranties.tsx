import { useEffect, useState } from 'react'
import { Plus, Search, QrCode } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useStore } from '@/hooks/use-store'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Warranties() {
  const { selectedStoreId } = useStore()
  const { toast } = useToast()

  const [warranties, setWarranties] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    product_name: '',
    customer_name: '',
    customer_email: '',
  })

  const loadData = async () => {
    if (!selectedStoreId) return
    try {
      const records = await pb.collection('warranties').getFullList({
        filter: `store_id = "${selectedStoreId}"`,
        sort: '-created',
      })
      setWarranties(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStoreId])

  useRealtime('warranties', () => {
    loadData()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStoreId) return
    setLoading(true)
    try {
      const trackingCode = 'GAR-' + Math.random().toString(36).substr(2, 6).toUpperCase()

      await pb.collection('warranties').create({
        store_id: selectedStoreId,
        ...formData,
        status: 'En Proceso',
        tracking_code: trackingCode,
      })

      await pb.collection('activities').create({
        store_id: selectedStoreId,
        description: `Nueva garantía abierta para ${formData.product_name}`,
        type: 'garantia',
      })

      toast({
        title: 'Garantía creada exitosamente',
        description: `Código generado: ${trackingCode}`,
      })
      setOpen(false)
      setFormData({ product_name: '', customer_name: '', customer_email: '' })
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la garantía.',
      })
    } finally {
      setLoading(false)
    }
  }

  const filtered = warranties.filter(
    (w) =>
      w.product_name.toLowerCase().includes(search.toLowerCase()) ||
      w.tracking_code.toLowerCase().includes(search.toLowerCase()) ||
      w.customer_name.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activa':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'En Proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Expirada':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (!selectedStoreId)
    return <div className="text-center py-10">Selecciona una tienda primero.</div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Garantías</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Nueva Garantía
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Garantía</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Producto o Artículo</Label>
                <Input
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Ej. Televisor LG 55'' OLED"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del Cliente</Label>
                <Input
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Email del Cliente</Label>
                <Input
                  required
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  Guardar y Generar QR
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-slate-50/50 rounded-t-xl">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por producto, cliente o código..."
                className="pl-9 bg-white border-slate-200 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Producto</TableHead>
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="text-right font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((w) => (
                <TableRow key={w.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono text-sm text-slate-600">
                    {w.tracking_code}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">{w.product_name}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{w.customer_name}</div>
                    <div className="text-xs text-slate-500">{w.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(w.status)}`}>
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Imprimir QR"
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
