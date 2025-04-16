"use client"

import { useState, useEffect, useRef } from "react"
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

  // Estado para la animación de count up
  const [valoresMostrados, setValoresMostrados] = useState<Record<string, number>>({})
  const animacionesRef = useRef<Record<string, number>>({})
  const [animacionIniciada, setAnimacionIniciada] = useState(false)

  // Iniciar la animación cuando el componente se monta
  useEffect(() => {
    // Inicializar los valores mostrados a 0 para cada cuenta
    const valoresIniciales: Record<string, number> = {}
    cuentas.forEach((cuenta) => {
      valoresIniciales[cuenta.id] = 0
    })
    setValoresMostrados(valoresIniciales)

    // Marcar que la animación debe iniciarse
    setAnimacionIniciada(true)

    // Limpiar las animaciones cuando el componente se desmonte
    return () => {
      Object.values(animacionesRef.current).forEach((id) => {
        cancelAnimationFrame(id)
      })
    }
  }, [cuentas.length]) // Reiniciar cuando cambie el número de cuentas

  // Ejecutar la animación cuando se marque como iniciada
  useEffect(() => {
    if (!animacionIniciada) return

    const duracion = 1000 // duración en ms
    const inicio = Date.now()

    // Función de easing para hacer la animación más natural
    const easeOutQuad = (t: number) => t * (2 - t)

    // Crear una copia de los valores iniciales
    const valoresIniciales = { ...valoresMostrados }

    const animar = () => {
      const ahora = Date.now()
      const progreso = Math.min(1, (ahora - inicio) / duracion)
      const factorEasing = easeOutQuad(progreso)

      // Actualizar cada valor mostrado
      const nuevosValores: Record<string, number> = {}
      cuentas.forEach((cuenta) => {
        nuevosValores[cuenta.id] =
          valoresIniciales[cuenta.id] + (cuenta.saldo - valoresIniciales[cuenta.id]) * factorEasing
      })

      setValoresMostrados(nuevosValores)

      if (progreso < 1) {
        // Continuar la animación
        animacionesRef.current["principal"] = requestAnimationFrame(animar)
      } else {
        // Finalizar la animación
        setAnimacionIniciada(false)
        // Asegurarse de que los valores finales sean exactos
        const valoresFinales: Record<string, number> = {}
        cuentas.forEach((cuenta) => {
          valoresFinales[cuenta.id] = cuenta.saldo
        })
        setValoresMostrados(valoresFinales)
      }
    }

    // Iniciar la animación
    animacionesRef.current["principal"] = requestAnimationFrame(animar)

    // Limpiar la animación si el componente se desmonta
    return () => {
      cancelAnimationFrame(animacionesRef.current["principal"])
    }
  }, [animacionIniciada, cuentas])

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
                  <p className="text-2xl font-bold">{formatCurrency(valoresMostrados[cuenta.id] || 0)}</p>
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
