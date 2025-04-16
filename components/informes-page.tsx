"use client"

import { useState } from "react"
import { useData, type TipoTransaccion } from "./data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SelectorMes } from "./selector-mes"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraficoCircular } from "./grafico-circular"
import { GraficoBarras } from "./grafico-barras"
import { formatCurrency } from "@/lib/utils"

export function InformesPage() {
  const { filtroMes, setFiltroMes, categorias, cuentas, obtenerTransaccionesFiltradas } = useData()
  const [tipoActivo, setTipoActivo] = useState<TipoTransaccion>("gasto")

  const transacciones = obtenerTransaccionesFiltradas()
  const transaccionesFiltradas = transacciones.filter((t) => t.tipo === tipoActivo)

  // Datos para gráfico por categoría
  const datosPorCategoria = categorias
    .filter((c) => c.tipo === tipoActivo)
    .map((categoria) => {
      const total = transaccionesFiltradas
        .filter((t) => t.categoriaId === categoria.id)
        .reduce((sum, t) => sum + t.monto, 0)
      return {
        id: categoria.id,
        label: categoria.nombre,
        value: total,
        color: categoria.color,
      }
    })
    .filter((item) => item.value > 0)

  // Datos para gráfico por cuenta
  const datosPorCuenta = cuentas
    .map((cuenta) => {
      const total = transaccionesFiltradas.filter((t) => t.cuentaId === cuenta.id).reduce((sum, t) => sum + t.monto, 0)
      return {
        id: cuenta.id,
        label: cuenta.nombre,
        value: total,
      }
    })
    .filter((item) => item.value > 0)

  // Datos para gráfico por mes (últimos 6 meses)
  const obtenerDatosPorMes = () => {
    const datos = []
    const mesActual = new Date(filtroMes)

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(mesActual)
      fecha.setMonth(fecha.getMonth() - i)

      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

      const transaccionesMes = transacciones.filter((t) => {
        const fechaTransaccion = new Date(t.fecha)
        return fechaTransaccion >= inicio && fechaTransaccion <= fin && t.tipo === tipoActivo
      })

      const total = transaccionesMes.reduce((sum, t) => sum + t.monto, 0)

      datos.push({
        label: inicio.toLocaleDateString("es", { month: "short" }),
        value: total,
      })
    }

    return datos
  }

  const datosPorMes = obtenerDatosPorMes()

  const totalPorTipo = transaccionesFiltradas.reduce((sum, t) => sum + t.monto, 0)

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <SelectorMes fecha={filtroMes} onChange={setFiltroMes} />
      </div>

      <Tabs
        defaultValue="gasto"
        onValueChange={(value) => setTipoActivo(value as TipoTransaccion)}
        className="w-full mb-4"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="ingreso">Ingresos</TabsTrigger>
          <TabsTrigger value="gasto">Gastos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tipoActivo === "ingreso" ? "Ingresos" : "Gastos"} por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {datosPorCategoria.length > 0 ? (
              <div className="h-[300px]">
                <GraficoCircular datos={datosPorCategoria} />
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No hay datos para mostrar en este período</div>
            )}
            {datosPorCategoria.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="font-medium">
                  Total: <span className="font-bold">{formatCurrency(totalPorTipo)}</span>
                </div>
                {datosPorCategoria.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(item.value)}</span>
                      <span className="text-muted-foreground">({Math.round((item.value / totalPorTipo) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tipoActivo === "ingreso" ? "Ingresos" : "Gastos"} por cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            {datosPorCuenta.length > 0 ? (
              <div className="h-[300px]">
                <GraficoBarras datos={datosPorCuenta} />
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No hay datos para mostrar en este período</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tipoActivo === "ingreso" ? "Ingresos" : "Gastos"} por mes</CardTitle>
          </CardHeader>
          <CardContent>
            {datosPorMes.some((d) => d.value > 0) ? (
              <div className="h-[300px]">
                <GraficoBarras datos={datosPorMes} />
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No hay datos para mostrar en este período</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
