"use client"

import { useData } from "./data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconoCategoria } from "./icono-categoria"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TransaccionForm } from "./transaccion-form"
import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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

export function ListaTransacciones() {
  const { obtenerTransaccionesFiltradas, categorias, cuentas, eliminarTransaccion } = useData()
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<string | null>(null)
  const [dialogEdicionAbierto, setDialogEdicionAbierto] = useState(false)
  const [alertaEliminacionAbierta, setAlertaEliminacionAbierta] = useState(false)

  const transacciones = obtenerTransaccionesFiltradas()

  const handleEliminar = () => {
    if (transaccionSeleccionada) {
      eliminarTransaccion(transaccionSeleccionada)
      setTransaccionSeleccionada(null)
      setAlertaEliminacionAbierta(false)
    }
  }

  if (transacciones.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No hay transacciones en este período.</div>
  }

  return (
    <>
      <h2 className="font-medium mb-2">Historial de transacciones</h2>
      <div className="space-y-3">
        {transacciones.map((transaccion) => {
          const categoria = categorias.find((c) => c.id === transaccion.categoriaId)
          const cuenta = cuentas.find((c) => c.id === transaccion.cuentaId)

          return (
            <Card key={transaccion.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="mr-3">
                    <IconoCategoria icono={categoria?.icono || "HelpCircle"} color={categoria?.color || "gray"} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{categoria?.nombre || "Sin categoría"}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{cuenta?.nombre || "Sin cuenta"}</span>
                      <span className="text-xs">•</span>
                      <span>{format(new Date(transaccion.fecha), "d MMM", { locale: es })}</span>
                    </div>
                    {transaccion.notas && (
                      <div className="text-sm text-muted-foreground mt-1 italic">{transaccion.notas}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-medium ${transaccion.tipo === "ingreso" ? "text-green-500" : "text-red-500"}`}
                    >
                      {transaccion.tipo === "ingreso" ? "+" : "-"}
                      {formatCurrency(transaccion.monto)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setTransaccionSeleccionada(transaccion.id)
                            setDialogEdicionAbierto(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => {
                            setTransaccionSeleccionada(transaccion.id)
                            setAlertaEliminacionAbierta(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogEdicionAbierto} onOpenChange={setDialogEdicionAbierto}>
        <DialogContent className="sm:max-w-[425px]">
          {transaccionSeleccionada && (
            <TransaccionForm
              transaccionId={transaccionSeleccionada}
              onSuccess={() => {
                setDialogEdicionAbierto(false)
                setTransaccionSeleccionada(null)
              }}
            />
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
