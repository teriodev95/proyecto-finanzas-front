"use client"

import { useState } from "react"
import { useData } from "./data-provider"
import { Button } from "@/components/ui/button"
import { Download, Upload, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ExportarImportarDatos() {
  const { transacciones, categorias, cuentas, resetearDatos } = useData()
  const [datosImportar, setDatosImportar] = useState("")
  const [errorImportar, setErrorImportar] = useState<string | null>(null)
  const [importExitosa, setImportExitosa] = useState(false)

  const exportarDatos = () => {
    const datos = {
      transacciones,
      categorias,
      cuentas,
      version: "1.0.0",
      fecha: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(datos, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `finanzas_backup_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()

    // Limpieza
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importarDatos = () => {
    try {
      setErrorImportar(null)
      setImportExitosa(false)

      if (!datosImportar.trim()) {
        setErrorImportar("Por favor, ingresa los datos a importar")
        return
      }

      const datos = JSON.parse(datosImportar)

      // Validar estructura básica
      if (!datos.transacciones || !datos.categorias || !datos.cuentas) {
        setErrorImportar("El formato de los datos no es válido")
        return
      }

      // Guardar en localStorage
      localStorage.setItem("transacciones", JSON.stringify(datos.transacciones))
      localStorage.setItem("categorias", JSON.stringify(datos.categorias))
      localStorage.setItem("cuentas", JSON.stringify(datos.cuentas))

      setImportExitosa(true)
      setDatosImportar("")

      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setErrorImportar("Error al importar los datos. Verifica el formato JSON.")
      console.error("Error al importar datos:", error)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Copia de seguridad</h3>
      <p className="text-sm text-muted-foreground">
        Exporta tus datos para hacer una copia de seguridad o importa datos previamente exportados.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={exportarDatos} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar datos
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar datos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar datos</DialogTitle>
              <DialogDescription>
                Pega los datos JSON exportados previamente para restaurar tu información.
              </DialogDescription>
            </DialogHeader>

            {errorImportar && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorImportar}</AlertDescription>
              </Alert>
            )}

            {importExitosa && (
              <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>Datos importados correctamente. Recargando...</AlertDescription>
              </Alert>
            )}

            <Textarea
              placeholder="Pega aquí los datos JSON exportados..."
              value={datosImportar}
              onChange={(e) => setDatosImportar(e.target.value)}
              rows={10}
              className="font-mono text-xs"
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setDatosImportar("")}>
                Limpiar
              </Button>
              <Button onClick={importarDatos}>Importar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
