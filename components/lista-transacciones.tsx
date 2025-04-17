"use client"

import { useData } from "./data-provider"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconoCategoria } from "./icono-categoria"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TransaccionForm } from "./transaccion-form"
import { useState } from "react"
import { Trash2, ArrowDown, ArrowUp } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Modificar la función agruparPorDia para manejar correctamente las fechas
const agruparPorDia = (transacciones) => {
  const grupos = {}

  transacciones.forEach((transaccion) => {
    // Crear una fecha a partir de la cadena de fecha, asegurando que se use la fecha local
    // y no se vea afectada por la zona horaria
    const fechaOriginal = transaccion.fecha // formato "YYYY-MM-DD"
    const fechaKey = fechaOriginal // Usar directamente la fecha en formato YYYY-MM-DD como clave

    if (!grupos[fechaKey]) {
      // Crear un objeto Date para mostrar el formato correcto, pero usar la fecha original como clave
      const [year, month, day] = fechaOriginal.split("-").map(Number)
      const fecha = new Date(year, month - 1, day) // month es 0-indexed en JavaScript

      grupos[fechaKey] = {
        fecha,
        transacciones: [],
        totalIngresos: 0,
        totalEgresos: 0,
      }
    }

    grupos[fechaKey].transacciones.push(transaccion)

    if (transaccion.tipo === "ingreso") {
      grupos[fechaKey].totalIngresos += transaccion.monto
    } else {
      grupos[fechaKey].totalEgresos += transaccion.monto
    }
  })

  // Convertir a array y ordenar por fecha (más reciente primero)
  return Object.values(grupos).sort((a, b) => {
    // Ordenar por la fecha original en formato YYYY-MM-DD
    const fechaA = a.fecha.getTime()
    const fechaB = b.fecha.getTime()
    return fechaB - fechaA
  })
}

export function ListaTransacciones() {
  const { obtenerTransaccionesFiltradas, categorias, cuentas, eliminarTransaccion } = useData()
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null)
  const [dialogEdicionAbierto, setDialogEdicionAbierto] = useState(false)
  const [alertaEliminacionAbierta, setAlertaEliminacionAbierta] = useState(false)

  const transacciones = obtenerTransaccionesFiltradas()
  const gruposTransacciones = agruparPorDia(transacciones)

  const handleEliminar = () => {
    if (transaccionSeleccionada) {
      eliminarTransaccion(transaccionSeleccionada)
      setTransaccionSeleccionada(null)
      setAlertaEliminacionAbierta(false)
    }
  }

  const handleEditarTransaccion = (transaccionId) => {
    setTransaccionSeleccionada(transaccionId)
    setDialogEdicionAbierto(true)
  }

  const handleCerrarDialogEdicion = (open) => {
    setDialogEdicionAbierto(open)
    if (!open) {
      setTimeout(() => {
        setTransaccionSeleccionada(null)
      }, 300)
    }
  }

  if (transacciones.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay transacciones en este período.</div>
  }

  return (
    <>
      <h2 className="font-medium mb-2">Historial de transacciones</h2>
      <Accordion type="multiple" className="space-y-4">
        {gruposTransacciones.map((grupo) => {
          const fechaKey = format(grupo.fecha, "yyyy-MM-dd")

          return (
            <Card key={fechaKey} className="overflow-hidden">
              <AccordionItem value={fechaKey} className="border-none">
                <AccordionTrigger className="p-4 hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{format(grupo.fecha, "EEEE d 'de' MMMM", { locale: es })}</div>
                        <div className="text-sm text-muted-foreground">{grupo.transacciones.length} transacciones</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-green-500">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          <span className="text-sm">{formatCurrency(grupo.totalIngresos)}</span>
                        </div>
                        <div className="flex items-center text-red-500">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          <span className="text-sm">{formatCurrency(grupo.totalEgresos)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border-t border-border">
                    {grupo.transacciones.map((transaccion) => {
                      const categoria = categorias.find((c) => c.id === transaccion.categoriaId)
                      const cuenta = cuentas.find((c) => c.id === transaccion.cuentaId)

                      return (
                        <div
                          key={transaccion.id}
                          className="flex items-center p-4 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() => handleEditarTransaccion(transaccion.id)}
                        >
                          <div className="mr-3">
                            <IconoCategoria
                              icono={categoria?.icono || "HelpCircle"}
                              color={categoria?.color || "gray"}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{categoria?.nombre || "Sin categoría"}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{cuenta?.nombre || "Sin cuenta"}</span>
                            </div>
                            {transaccion.notas && (
                              <div className="text-sm text-muted-foreground mt-1 italic">{transaccion.notas}</div>
                            )}
                          </div>
                          <div>
                            <div
                              className={`font-medium ${transaccion.tipo === "ingreso" ? "text-green-500" : "text-red-500"}`}
                            >
                              {transaccion.tipo === "ingreso" ? "+" : "-"}
                              {formatCurrency(transaccion.monto)}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          )
        })}
      </Accordion>

      <Dialog open={dialogEdicionAbierto} onOpenChange={handleCerrarDialogEdicion}>
        <DialogContent className="sm:max-w-[425px]">
          {transaccionSeleccionada && (
            <>
              <TransaccionForm
                transaccionId={transaccionSeleccionada}
                onSuccess={() => {
                  setDialogEdicionAbierto(false)
                }}
              />
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    setDialogEdicionAbierto(false)
                    setAlertaEliminacionAbierta(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar transacción
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertaEliminacionAbierta} onOpenChange={setAlertaEliminacionAbierta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción y actualizará el saldo de
              la cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
