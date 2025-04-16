"use client"

import { useState } from "react"
import { useData } from "./data-provider"
import { TransaccionForm } from "./transaccion-form"
import { ListaTransacciones } from "./lista-transacciones"
import { ResumenFinanciero } from "./resumen-financiero"
import { SelectorMes } from "./selector-mes"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function TransaccionesPage() {
  const [open, setOpen] = useState(false)
  const { filtroMes, setFiltroMes } = useData()

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <SelectorMes fecha={filtroMes} onChange={setFiltroMes} />
      </div>

      <ResumenFinanciero />

      <ListaTransacciones />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <TransaccionForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
