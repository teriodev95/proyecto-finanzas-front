"use client"

import { useState } from "react"
import { useData } from "./data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CuentaForm } from "./cuenta-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

export function CuentasPage() {
  const { cuentas, eliminarCuenta } = useData()
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [alertaEliminacionAbierta, setAlertaEliminacionAbierta] = useState(false)

  const handleEliminar = () => {
    if (cuentaSeleccionada) {
      eliminarCuenta(cuentaSeleccionada)
      setCuentaSeleccionada(null)
      setAlertaEliminacionAbierta(false)
    }
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Mis cuentas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <CuentaForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {cuentas.map((cuenta) => (
          <Card key={cuenta.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{cuenta.nombre}</h3>
                  <p className="text-2xl font-bold">{formatCurrency(cuenta.saldo)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setCuentaSeleccionada(cuenta.id)
                        setDialogAbierto(true)
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => {
                        setCuentaSeleccionada(cuenta.id)
                        setAlertaEliminacionAbierta(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="sm:max-w-[425px]">
          {cuentaSeleccionada && (
            <CuentaForm
              cuentaId={cuentaSeleccionada}
              onSuccess={() => {
                setDialogAbierto(false)
                setCuentaSeleccionada(null)
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
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta y todos sus datos asociados.
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
    </div>
  )
}
