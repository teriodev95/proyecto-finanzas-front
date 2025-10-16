"use client"

import { useState, useEffect } from "react"
import { useData, type TipoTransaccion } from "./api-data-provider"
import { IconoCategoria } from "./icono-categoria"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditarTransaccionDrawerProps {
  transaccionId: string | null
  isOpen: boolean
  onClose: () => void
  onEliminar: (id: string) => void
}

export function EditarTransaccionDrawer({ transaccionId, isOpen, onClose, onEliminar }: EditarTransaccionDrawerProps) {
  const { transacciones, categorias, cuentas, editarTransaccion } = useData()

  const [tipo, setTipo] = useState<TipoTransaccion>("gasto")
  const [monto, setMonto] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [cuentaId, setCuentaId] = useState("")
  const [fecha, setFecha] = useState("")
  const [notas, setNotas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (transaccionId && isOpen) {
      const transaccion = transacciones.find(t => t.id === transaccionId)
      if (transaccion) {
        setTipo(transaccion.tipo)
        setMonto(transaccion.monto.toString())
        setCategoriaId(transaccion.categoriaId)
        setCuentaId(transaccion.cuentaId)
        setFecha(transaccion.fecha)
        setNotas(transaccion.notas || "")
      }
    }
  }, [transaccionId, isOpen, transacciones])

  const handleGuardar = async () => {
    if (!transaccionId || !monto || !categoriaId || !cuentaId || !fecha) return

    setIsSubmitting(true)
    try {
      await editarTransaccion(transaccionId, {
        tipo,
        monto: parseFloat(monto),
        categoriaId,
        cuentaId,
        fecha,
        notas,
      })
      onClose()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo)

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Editar transacción</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Tipo - Tabs minimalistas */}
          <Tabs value={tipo} onValueChange={(v) => { setTipo(v as TipoTransaccion); setCategoriaId("") }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingreso">Ingreso</TabsTrigger>
              <TabsTrigger value="gasto">Gasto</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Monto - Input grande y limpio */}
          <div className="space-y-2">
            <Label>Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="pl-8 text-lg font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Categoría - Badges limpios */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <ScrollArea className="h-24 rounded-md border p-3">
              <div className="flex flex-wrap gap-2">
                {categoriasFiltradas.map((categoria) => (
                  <Badge
                    key={categoria.id}
                    variant={categoriaId === categoria.id ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 hover:bg-accent"
                    onClick={() => setCategoriaId(categoria.id)}
                  >
                    <IconoCategoria icono={categoria.icono} color={categoria.color} size={14} />
                    <span className="ml-1.5">{categoria.nombre}</span>
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Cuenta - Badges */}
          <div className="space-y-2">
            <Label>Cuenta</Label>
            <div className="flex flex-wrap gap-2">
              {cuentas.map((cuenta) => (
                <Badge
                  key={cuenta.id}
                  variant={cuentaId === cuenta.id ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 hover:bg-accent"
                  onClick={() => setCuentaId(cuenta.id)}
                >
                  {cuenta.nombre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega detalles..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DrawerFooter className="pt-6">
          <Button
            onClick={handleGuardar}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => transaccionId && onEliminar(transaccionId)}
              className="text-destructive hover:text-destructive"
            >
              Eliminar
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
