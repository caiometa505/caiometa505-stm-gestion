import { useEffect, useState } from 'react'
import { MoreHorizontal, ArrowRight, ArrowLeft, MessageSquare, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/hooks/use-store'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

const COLUMNS = ['Por Hacer', 'En Progreso', 'Resuelta', 'Escalada']

export default function Claims() {
  const { selectedStoreId } = useStore()
  const { toast } = useToast()

  const [claims, setClaims] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '' })

  const loadData = async () => {
    if (!selectedStoreId) return
    try {
      const records = await pb.collection('claims').getFullList({
        filter: `store_id = "${selectedStoreId}"`,
        sort: 'created',
      })
      setClaims(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStoreId])

  useRealtime('claims', () => {
    loadData()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStoreId) return
    try {
      await pb.collection('claims').create({
        store_id: selectedStoreId,
        ...formData,
        status: 'Por Hacer',
      })
      toast({ title: 'Reclamación creada correctamente' })
      setOpen(false)
      setFormData({ title: '', description: '' })
    } catch (err) {
      console.error(err)
      toast({ variant: 'destructive', title: 'Error', description: 'Ocurrió un error al guardar.' })
    }
  }

  const moveClaim = async (id: string, currentStatus: string, direction: 'next' | 'prev') => {
    const idx = COLUMNS.indexOf(currentStatus)
    const newIdx = direction === 'next' ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= COLUMNS.length) return

    try {
      await pb.collection('claims').update(id, { status: COLUMNS[newIdx] })
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error al mover' })
    }
  }

  if (!selectedStoreId)
    return <div className="text-center py-10">Selecciona una tienda primero.</div>

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Reclamaciones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Nueva Reclamación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Reclamación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Título corto</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej. Rotura en palet de transporte"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción detallada</Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe el incidente..."
                />
              </div>
              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Guardar Tablero
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start">
        {COLUMNS.map((col) => {
          const colClaims = claims.filter((c) => c.status === col)
          return (
            <div
              key={col}
              className="bg-slate-200/50 rounded-xl p-4 w-80 shrink-0 border border-slate-200 flex flex-col max-h-full"
            >
              <div className="flex justify-between items-center mb-4 px-1 shrink-0">
                <h3 className="font-semibold text-slate-700">{col}</h3>
                <Badge variant="secondary" className="bg-slate-300 text-slate-700">
                  {colClaims.length}
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-1 custom-scrollbar">
                {colClaims.length === 0 && (
                  <div className="text-center py-6 text-sm text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
                    Sin reclamaciones
                  </div>
                )}
                {colClaims.map((claim) => (
                  <Card
                    key={claim.id}
                    className="cursor-grab hover:shadow-md transition-shadow border-slate-200"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-medium leading-tight text-slate-800">
                          {claim.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mr-2 -mt-2 shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 pb-3">
                      <p className="text-xs text-slate-500 line-clamp-3">{claim.description}</p>
                    </CardContent>
                    <CardFooter className="p-3 flex justify-between items-center border-t border-slate-100 bg-slate-50/80 rounded-b-xl">
                      <div className="flex items-center text-xs text-slate-400 gap-1 font-medium">
                        <MessageSquare className="h-3 w-3" />
                        <span>0 msgs</span>
                      </div>
                      <div className="flex gap-1">
                        {COLUMNS.indexOf(col) > 0 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-white"
                            onClick={() => moveClaim(claim.id, col, 'prev')}
                          >
                            <ArrowLeft className="h-3 w-3 text-slate-600" />
                          </Button>
                        )}
                        {COLUMNS.indexOf(col) < COLUMNS.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 bg-white"
                            onClick={() => moveClaim(claim.id, col, 'next')}
                          >
                            <ArrowRight className="h-3 w-3 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
