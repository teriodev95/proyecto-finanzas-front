"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useData } from "./data-provider"
import { Button } from "@/components/ui/button"
import { Download, Upload, AlertTriangle, FileUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export function ExportarImportarDatos() {
  const { transacciones, categorias, cuentas, resetearDatos } = useData()
  const [errorImportar, setErrorImportar] = useState<string | null>(null)
  const [importExitosa, setImportExitosa] = useState(false)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setArchivoSeleccionado(files[0])
      setErrorImportar(null)
    }
  }

  const importarDatos = async () => {
    try {
      setErrorImportar(null)
      setImportExitosa(false)

      if (!archivoSeleccionado) {
        setErrorImportar("Por favor, selecciona un archivo JSON para importar")
        return
      }

      // Verificar que sea un archivo JSON
      if (!archivoSeleccionado.name.toLowerCase().endsWith(".json")) {
        setErrorImportar("El archivo debe ser de tipo JSON (.json)")
        return
      }

      // Leer el contenido del archivo
      const contenido = await archivoSeleccionado.text()

      // Parsear el JSON
      const datos = JSON.parse(contenido)

      // Validar estructura básica
      if (!datos.transacciones || !Array.isArray(datos.transacciones)) {
        setErrorImportar("El formato de los datos no es válido: faltan transacciones")
        return
      }

      if (!datos.categorias || !Array.isArray(datos.categorias)) {
        setErrorImportar("El formato de los datos no es válido: faltan categorías")
        return
      }

      if (!datos.cuentas || !Array.isArray(datos.cuentas)) {
        setErrorImportar("El formato de los datos no es válido: faltan cuentas")
        return
      }

      // Validar que las categorías tengan la estructura correcta
      const categoriasValidas = datos.categorias.every(
        (cat) => cat.id && cat.nombre && cat.tipo && cat.icono && cat.color,
      )

      if (!categoriasValidas) {
        setErrorImportar("Algunas categorías no tienen la estructura correcta (faltan id, nombre, tipo, icono o color)")
        return
      }

      // Validar que las transacciones tengan categorías válidas
      const categoriasIds = new Set(datos.categorias.map((c) => c.id))
      const transaccionesValidas = datos.transacciones.every((t) => categoriasIds.has(t.categoriaId))

      if (!transaccionesValidas) {
        setErrorImportar("Algunas transacciones hacen referencia a categorías que no existen en los datos importados")
        return
      }

      // Guardar en localStorage
      localStorage.setItem("transacciones", JSON.stringify(datos.transacciones))
      localStorage.setItem("categorias", JSON.stringify(datos.categorias))
      localStorage.setItem("cuentas", JSON.stringify(datos.cuentas))

      setImportExitosa(true)
      setArchivoSeleccionado(null)

      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Recargar la página para aplicar los cambios
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setErrorImportar("Error al importar los datos. Verifica que el archivo sea un JSON válido.")
      console.error("Error al importar datos:", error)
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogAbierto(open)
    if (!open) {
      // Limpiar el estado cuando se cierra el diálogo
      setArchivoSeleccionado(null)
      setErrorImportar(null)
      setImportExitosa(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

        <Dialog open={dialogAbierto} onOpenChange={handleDialogChange}>
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
                Selecciona un archivo JSON exportado previamente para restaurar tu información.
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

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file-upload">Archivo JSON</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                  />
                </div>
              </div>
              {archivoSeleccionado && (
                <p className="text-sm text-muted-foreground mt-1">Archivo seleccionado: {archivoSeleccionado.name}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setArchivoSeleccionado(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                Cancelar
              </Button>
              <Button onClick={importarDatos} disabled={!archivoSeleccionado || importExitosa}>
                <FileUp className="h-4 w-4 mr-2" />
                Importar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
