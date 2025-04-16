"use client"

import { useState, useEffect, useRef } from "react"
import { useData } from "./data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Eye, EyeOff, Scale } from "lucide-react"
import { Button } from "./ui/button"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function ResumenFinanciero() {
  const {
    obtenerSaldoTotal,
    obtenerIngresosTotales,
    obtenerGastosTotales,
    obtenerBalance,
    paginaActual,
    setPaginaActual,
    filtroMes,
  } = useData()

  const [ocultarSaldo, setOcultarSaldo] = useState(false)
  const [animarSaldo, setAnimarSaldo] = useState(false)
  const [valorMostrado, setValorMostrado] = useState(0)
  const saldoTotal = obtenerSaldoTotal()
  const animacionRef = useRef<number | null>(null)

  // Animación de counting up cuando cambia el saldo
  useEffect(() => {
    if (ocultarSaldo) return

    // Cancelar cualquier animación previa
    if (animacionRef.current !== null) {
      cancelAnimationFrame(animacionRef.current)
    }

    const duracion = 1000 // duración en ms
    const inicio = Date.now()
    const valorInicial = valorMostrado
    const valorFinal = saldoTotal

    const animar = () => {
      const ahora = Date.now()
      const progreso = Math.min(1, (ahora - inicio) / duracion)

      // Función de easing para hacer la animación más natural
      const easeOutQuad = (t: number) => t * (2 - t)
      const valorActual = valorInicial + (valorFinal - valorInicial) * easeOutQuad(progreso)

      setValorMostrado(valorActual)

      if (progreso < 1) {
        animacionRef.current = requestAnimationFrame(animar)
      }
    }

    animacionRef.current = requestAnimationFrame(animar)

    return () => {
      if (animacionRef.current !== null) {
        cancelAnimationFrame(animacionRef.current)
      }
    }
  }, [saldoTotal, ocultarSaldo])

  // Formatear el mes actual para mostrar en el título
  const mesActual = format(filtroMes, "MMMM yyyy", { locale: es })
    .charAt(0)
    .toUpperCase()
    .concat(format(filtroMes, "MMMM yyyy", { locale: es }).slice(1))

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg text-muted-foreground">Saldo total</h2>
          <Button variant="ghost" size="icon" onClick={() => setOcultarSaldo(!ocultarSaldo)} className="h-8 w-8">
            {ocultarSaldo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-4xl font-bold mb-6">{ocultarSaldo ? "******" : formatCurrency(valorMostrado)}</p>

        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div className="text-sm text-muted-foreground mb-2">Resumen de {mesActual}</div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-1 rounded">
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <span>Ingresos</span>
            </div>
            <span className="text-green-500">{formatCurrency(obtenerIngresosTotales())}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 p-1 rounded">
                <ArrowDown className="h-4 w-4 text-red-500" />
              </div>
              <span>Gastos</span>
            </div>
            <span className="text-red-500">{formatCurrency(obtenerGastosTotales())}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1 rounded">
                <Scale className="h-4 w-4 text-primary" />
              </div>
              <span>Balance</span>
            </div>
            <span className={obtenerBalance() >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(obtenerBalance())}
            </span>
          </div>
        </div>

        <Button variant="secondary" className="w-full mt-4" onClick={() => setPaginaActual("cuentas")}>
          Gestionar cuentas
        </Button>
      </CardContent>
    </Card>
  )
}
