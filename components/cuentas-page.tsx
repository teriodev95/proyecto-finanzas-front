"use client"

import { useState, useEffect, useRef } from "react"
import { useData } from "./api-data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

export function CuentasPage() {
  const { cuentas, eliminarCuenta } = useData()
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [alertaEliminacionAbierta, setAlertaEliminacionAbierta] = useState(false)
  const [cuentaParaEliminar, setCuentaParaEliminar] = useState(null) // Estado separado para la cuenta a eliminar
  
  // Estado para la animación de count up
  const [valoresMostrados, setValoresMostrados] = useState({})
  const animacionesRef = useRef({})
  const [animacionIniciada, setAnimacionIniciada] = useState(false)

  // Iniciar la animación cuando el componente se monta
  useEffect(() => {
    // Inicializar los valores mostrados a 0 para cada cuenta
    const valoresIniciales = {}
    cuentas.forEach((cuenta) => {
      valoresIniciales[cuenta.id] = 0
    })
    setValoresMostrados(valoresIniciales)

    // Marcar que la animación debe iniciarse
    setAnimacionIniciada(true)

    // Limpiar las animaciones cuando el componente se desmonte
    return () => {
      Object.values(animacionesRef.current).forEach((id) => {
        if (id) cancelAnimationFrame(id)
      })
    }
  }, [cuentas.length]) // Reiniciar cuando cambie el número de cuentas

  // Crear refs para evitar dependencias cambiantes
  const cuentasRef = useRef(cuentas)

  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    cuentasRef.current = cuentas
  }, [cuentas])

  // Ejecutar la animación cuando se marque como iniciada
  useEffect(() => {
    if (!animacionIniciada) return

    const duracion = 1000 // duración en ms
    const inicio = Date.now()

    // Función de easing para hacer la animación más natural
    const easeOutQuad = (t) => t * (2 - t)

    // Crear una copia de los valores iniciales
    const valoresIniciales = { ...valoresMostrados }

    const animar = () => {
      const ahora = Date.now()
      const progreso = Math.min(1, (ahora - inicio) / duracion)
      const factorEasing = easeOutQuad(progreso)

      // Actualizar cada valor mostrado
      const nuevosValores = {}
      cuentasRef.current.forEach((cuenta) => {
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
        const valoresFinales = {}
        cuentasRef.current.forEach((cuenta) => {
          valoresFinales[cuenta.id] = cuenta.saldo
        })
        setValoresMostrados(valoresFinales)
      }
    }

    // Iniciar la animación
    animacionesRef.current["principal"] = requestAnimationFrame(animar)

    // Limpiar la animación si el componente se desmonta
    return () => {
      if (animacionesRef.current["principal"]) {
        cancelAnimationFrame(animacionesRef.current["principal"])
      }
    }
  }, [animacionIniciada])

  // Efecto para realizar la eliminación después de que se cierre el diálogo
  useEffect(() => {
    // Si el diálogo se ha cerrado y hay una cuenta para eliminar
    if (!alertaEliminacionAbierta && cuentaParaEliminar) {
      // Ejecutamos la eliminación después de que el diálogo se haya cerrado completamente
      eliminarCuenta(cuentaParaEliminar)
      // Limpiamos el estado
      setCuentaParaEliminar(null)
    }
  }, [alertaEliminacionAbierta, cuentaParaEliminar, eliminarCuenta])

  const handleEditarCuenta = (cuentaId) => {
    setCuentaSeleccionada(cuentaId)
    setDialogAbierto(true)
  }

  const handleCerrarDialogEdicion = (open) => {
    setDialogAbierto(open)
    // Limpiar la cuenta seleccionada después de que el diálogo se haya cerrado
    if (!open) {
      setTimeout(() => {
        setCuentaSeleccionada(null)
      }, 300)
    }
  }

  // Modificamos los manejadores para la eliminación
  const handleSolicitarEliminacion = (cuentaId) => {
    setCuentaSeleccionada(cuentaId)
    setAlertaEliminacionAbierta(true)
  }

  const handleCerrarAlertaEliminacion = (open) => {
    setAlertaEliminacionAbierta(open)
    // Si se está cerrando la alerta, limpiar la cuenta seleccionada
    if (!open) {
      setTimeout(() => {
        setCuentaSeleccionada(null)
      }, 300)
    }
  }

  // Este manejador simplemente marca la cuenta para eliminar
  // La eliminación real ocurrirá en el efecto después de que se cierre el diálogo
  const handleConfirmarEliminacion = () => {
    setCuentaParaEliminar(cuentaSeleccionada)
    // No cerramos el diálogo manualmente, eso lo hace AlertDialogAction
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
            <DialogHeader>
              <DialogTitle>Nueva Cuenta</DialogTitle>
            </DialogHeader>
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
                    <DropdownMenuItem onClick={() => handleEditarCuenta(cuenta.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => handleSolicitarEliminacion(cuenta.id)}
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

      <Dialog open={dialogAbierto} onOpenChange={handleCerrarDialogEdicion}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cuenta</DialogTitle>
          </DialogHeader>
          {cuentaSeleccionada && (
            <CuentaForm
              cuentaId={cuentaSeleccionada}
              onSuccess={() => {
                setDialogAbierto(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={alertaEliminacionAbierta} 
        onOpenChange={handleCerrarAlertaEliminacion}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmarEliminacion} 
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
