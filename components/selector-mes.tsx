"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ChevronDown } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between bg-muted/40">
          {formatoMesAnio(fecha)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="month" selected={fecha} onSelect={(date) => date && onChange(date)} locale={es} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
