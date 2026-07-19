import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, Loader2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/hooks/use-store'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function Reception() {
  const { selectedStoreId } = useStore()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [ocrData, setOcrData] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = (file: File) => {
    setFile(file)
    setProcessing(true)

    // Simulate OCR processing delay
    setTimeout(() => {
      setOcrData({
        provider: 'Logística Industrial S.A.',
        date: new Date().toISOString().split('T')[0],
        total_items: Math.floor(Math.random() * 100) + 10,
        amount: (Math.random() * 5000 + 100).toFixed(2),
      })
      setProcessing(false)
      toast({
        title: 'OCR Completado',
        description: 'Revisa los datos extraídos antes de guardar.',
      })
    }, 2500)
  }

  const handleSave = async () => {
    if (!selectedStoreId || !ocrData) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('store_id', selectedStoreId)
      formData.append('provider', ocrData.provider)
      formData.append('date', ocrData.date + ' 12:00:00.000Z')
      formData.append('total_items', ocrData.total_items.toString())
      formData.append('amount', ocrData.amount.toString())
      formData.append('status', 'Pendiente')
      if (file) formData.append('document', file)

      await pb.collection('receptions').create(formData)

      await pb.collection('activities').create({
        store_id: selectedStoreId,
        description: `Nueva mercancía recibida de ${ocrData.provider}`,
        type: 'recepcion',
      })

      toast({
        title: 'Guardado exitoso',
        description: 'La recepción ha sido registrada correctamente.',
      })
      setFile(null)
      setOcrData(null)
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la recepción.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (!selectedStoreId)
    return <div className="text-center py-10">Selecciona una tienda primero.</div>

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Recepción de Mercancía</h1>
      </div>

      {!ocrData && !processing && (
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-colors">
          <CardContent
            className="flex flex-col items-center justify-center py-24 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-5 bg-white rounded-2xl shadow-sm mb-6 cursor-pointer">
              <UploadCloud className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">Sube el albarán o factura</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Arrastra y suelta tu documento aquí, o haz clic para explorar. El sistema OCR extraerá
              los datos automáticamente.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <Button className="mt-8 bg-blue-600 hover:bg-blue-700 px-8">Seleccionar Archivo</Button>
          </CardContent>
        </Card>
      )}

      {processing && (
        <Card className="border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping"></div>
              <Loader2 className="h-14 w-14 text-blue-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-xl font-semibold mt-6">Procesando documento...</h3>
            <p className="text-sm text-slate-500 mt-2">
              Nuestra IA está analizando el texto y extrayendo la información.
            </p>
          </CardContent>
        </Card>
      )}

      {ocrData && !processing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 rounded-t-xl border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-slate-500" />
                Documento Original
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center bg-slate-100/50 p-4 rounded-b-xl min-h-[400px]">
              {file && file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Original"
                  className="max-h-[500px] object-contain rounded shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center flex-col text-slate-400">
                  <FileText className="h-16 w-16 mb-2" />
                  <p>Previsualización de PDF no disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-100">
            <CardHeader className="bg-blue-50/50 rounded-t-xl border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Datos Extraídos
              </CardTitle>
              <CardDescription>Verifica y corrige la información antes de guardar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input
                  value={ocrData.provider}
                  onChange={(e) => setOcrData({ ...ocrData, provider: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha del Albarán</Label>
                <Input
                  type="date"
                  value={ocrData.date}
                  onChange={(e) => setOcrData({ ...ocrData, date: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Bultos</Label>
                  <Input
                    type="number"
                    value={ocrData.total_items}
                    onChange={(e) =>
                      setOcrData({ ...ocrData, total_items: parseInt(e.target.value) || 0 })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Importe Total (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={ocrData.amount}
                    onChange={(e) =>
                      setOcrData({ ...ocrData, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    setOcrData(null)
                    setFile(null)
                  }}
                >
                  Descartar
                </Button>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Confirmar y Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
