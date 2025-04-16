"use client"

import { useState } from "react"
import { useData } from "./data-provider"
import { TransaccionForm } from "./transaccion-form"
import { ListaTransacciones } from "./lista-transacciones"
import { ResumenFinanciero } from "./resumen-financiero"
import { SelectorMes } from "./selector-mes"
import { Button } from "@/components/ui/button"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function TransaccionesPage() {
  const [open, setOpen] = useState(false)
  const [tipoTransaccion, setTipoTransaccion] = useState<"ingreso" | "gasto">("gasto")
  const { filtroMes, setFiltroMes } = useData()

  const abrirFormulario = (tipo: "ingreso" | "gasto") => {
    setTipoTransaccion(tipo)
    setOpen(true)
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <SelectorMes fecha={filtroMes} onChange={setFiltroMes} />
      </div>

      <ResumenFinanciero />

      <ListaTransacciones />

      {/* Botones de acción rápida (horizontales) - Gasto a la derecha para mayor accesibilidad */}
      <div className="fixed bottom-20 right-4 flex flex-row gap-3">
        <Button
          onClick={() => abrirFormulario("ingreso")}
          size="sm"
          variant="outline"
          className={cn(
            "rounded-full h-12 w-12 p-0 border-2",
            "fab-button-minimal border-green-500 text-green-500 bg-background hover:bg-green-50 dark:hover:bg-green-950",
          )}
          aria-label="Registrar ingreso"
        >
          <ArrowUpCircle className="h-6 w-6" />
        </Button>

        <Button
          onClick={() => abrirFormulario("gasto")}
          size="sm"
          variant="outline"
          className={cn(
            "rounded-full h-12 w-12 p-0 border-2",
            "fab-button-minimal border-red-500 text-red-500 bg-background hover:bg-red-50 dark:hover:bg-red-950",
          )}
          aria-label="Registrar gasto"
        >
          <ArrowDownCircle className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <TransaccionForm tipoInicial={tipoTransaccion} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
