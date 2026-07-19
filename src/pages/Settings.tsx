import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Ajustes globales del sistema y preferencias de la cuenta.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Gestiona las alertas y correos electrónicos que recibes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Alertas de OCR</Label>
              <p className="text-sm text-slate-500 max-w-[80%]">
                Recibir notificación cuando el sistema OCR requiera validación manual de un albarán.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Nuevas Reclamaciones</Label>
              <p className="text-sm text-slate-500 max-w-[80%]">
                Notificar inmediatamente al recibir nuevas reclamaciones de clientes o transporte.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Resumen Diario</Label>
              <p className="text-sm text-slate-500 max-w-[80%]">
                Enviar un correo a las 18:00 con el resumen de garantías procesadas en el día.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
