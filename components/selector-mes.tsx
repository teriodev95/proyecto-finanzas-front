"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale"
import { format, addMonths, subMonths } from "date-fns"

interface SelectorMesProps {
  fecha: Date
  onChange: (fecha: Date) => void
}

export function SelectorMes({ fecha, onChange }: SelectorMesProps) {
  const formatoMesAnio = (date: Date) => {
    return format(date, "MMM. yyyy", { locale: es })
      .replace(".", "")
      .charAt(0)
      .toUpperCase()
      .concat(format(date, "MMM. yyyy", { locale: es }).slice(1))
  }

  const mesAnterior = () => {
    onChange(subMonths(fecha, 1))
  }

  const mesSiguiente = () => {
    onChange(addMonths(fecha, 1))
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={mesAnterior} aria-label="Mes anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-[140px] px-3 py-2 rounded-md border bg-muted/40 flex justify-between items-center">
        <span>{formatoMesAnio(fecha)}</span>
      </div>

      <Button variant="ghost" size="icon" onClick={mesSiguiente} aria-label="Mes siguiente">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
