"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
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

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[140px] justify-between bg-muted/40">
            {formatoMesAnio(fecha)}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="month"
            selected={fecha}
            onSelect={(date) => date && onChange(date)}
            locale={es}
            initialFocus
            disabled={(date) => {
              // Opcional: deshabilitar fechas futuras
              return date > new Date()
            }}
          />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" onClick={mesSiguiente} aria-label="Mes siguiente">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
