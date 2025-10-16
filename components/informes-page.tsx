"use client"

import { useState, useMemo } from "react"
import { useData, type TipoTransaccion } from "./api-data-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraficoCircular } from "./grafico-circular"
import { GraficoBarras } from "./grafico-barras"
import { formatCurrency } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { Separator } from "./separator"
import { format, getYear } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function InformesPage() {
  const { filtroMes, setFiltroMes, categorias, cuentas, transacciones, obtenerTransaccionesFiltradas } = useData()
  const [tipoActivo, setTipoActivo] = useState<TipoTransaccion>("gasto")

  // Obtener transacciones del mes actual
  const transaccionesMes = obtenerTransaccionesFiltradas()
  const transaccionesFiltradas = transaccionesMes.filter((t) => t.tipo === tipoActivo)

  // Obtener año actual y anterior
  const añoActual = getYear(filtroMes)
  const añoAnterior = añoActual - 1

  // Función para obtener transacciones de todo el año actual
  const obtenerTransaccionesAño = (año: number) => {
    const inicio = new Date(año, 0, 1) // 1 de enero del año
    const fin = new Date(año, 11, 31) // 31 de diciembre del año

    return transacciones.filter((t) => {
      const fechaTransaccion = new Date(t.fecha)
      return fechaTransaccion >= inicio && fechaTransaccion <= fin
    })
  }

  // Obtener transacciones del año actual y anterior
  const transaccionesAñoActual = useMemo(() => obtenerTransaccionesAño(añoActual), [transacciones, añoActual])
  const transaccionesAñoAnterior = useMemo(() => obtenerTransaccionesAño(añoAnterior), [transacciones, añoAnterior])

  // Calcular totales anuales
  const totalIngresosAñoActual = transaccionesAñoActual
    .filter((t) => t.tipo === "ingreso")
    .reduce((sum, t) => sum + t.monto, 0)
  const totalGastosAñoActual = transaccionesAñoActual
    .filter((t) => t.tipo === "gasto")
    .reduce((sum, t) => sum + t.monto, 0)
  const saldoNetoAñoActual = totalIngresosAñoActual - totalGastosAñoActual

  // Calcular totales del año anterior
  const totalIngresosAñoAnterior = transaccionesAñoAnterior
    .filter((t) => t.tipo === "ingreso")
    .reduce((sum, t) => sum + t.monto, 0)
  const totalGastosAñoAnterior = transaccionesAñoAnterior
    .filter((t) => t.tipo === "gasto")
    .reduce((sum, t) => sum + t.monto, 0)

  // Calcular cambios porcentuales
  const cambioIngresos =
    totalIngresosAñoAnterior > 0
      ? ((totalIngresosAñoActual - totalIngresosAñoAnterior) / totalIngresosAñoAnterior) * 100
      : 0
  const cambioGastos =
    totalGastosAñoAnterior > 0 ? ((totalGastosAñoActual - totalGastosAñoAnterior) / totalGastosAñoAnterior) * 100 : 0

  // Calcular promedios mensuales
  const mesesTranscurridos = Math.min(new Date().getMonth() + 1, 12)
  const promedioIngresosMensual = totalIngresosAñoActual / mesesTranscurridos
  const promedioGastosMensual = totalGastosAñoActual / mesesTranscurridos

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
    .sort((a, b) => b.value - a.value) // Ordenar de mayor a menor

  // Datos para gráfico por mes (últimos 6 meses)
  const obtenerDatosPorMes = () => {
    const meses = []
    const mesActual = new Date(filtroMes)

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(mesActual)
      fecha.setMonth(fecha.getMonth() - i)

      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

      const transaccionesMes = transacciones.filter((t) => {
        const fechaTransaccion = new Date(t.fecha)
        return fechaTransaccion >= inicio && fechaTransaccion <= fin
      })

      const ingresos = transaccionesMes.filter((t) => t.tipo === "ingreso").reduce((sum, t) => sum + t.monto, 0)
      const gastos = transaccionesMes.filter((t) => t.tipo === "gasto").reduce((sum, t) => sum + t.monto, 0)

      meses.push({
        mes:
          format(inicio, "MMM", { locale: es }).charAt(0).toUpperCase() +
          format(inicio, "MMM", { locale: es }).slice(1),
        año: fecha.getFullYear(),
        ingresos,
        gastos,
        balance: ingresos - gastos,
      })
    }

    return meses
  }

  const datosPorMes = obtenerDatosPorMes()

  // Datos para gráfico de barras comparativo
  const datosComparativos = datosPorMes.map((mes) => ({
    name: `${mes.mes} ${mes.año}`,
    ingresos: mes.ingresos,
    gastos: mes.gastos,
  }))

  // Datos para desglose mensual del año actual
  const obtenerDesgloseAnual = () => {
    const desglose = []
    const añoActual = getYear(filtroMes)

    for (let mes = 0; mes < 12; mes++) {
      const inicio = new Date(añoActual, mes, 1)
      const fin = new Date(añoActual, mes + 1, 0)

      const transaccionesMes = transacciones.filter((t) => {
        const fechaTransaccion = new Date(t.fecha)
        return fechaTransaccion >= inicio && fechaTransaccion <= fin
      })

      const ingresos = transaccionesMes.filter((t) => t.tipo === "ingreso").reduce((sum, t) => sum + t.monto, 0)
      const gastos = transaccionesMes.filter((t) => t.tipo === "gasto").reduce((sum, t) => sum + t.monto, 0)
      const balance = ingresos - gastos

      desglose.push({
        mes:
          format(inicio, "MMMM", { locale: es }).charAt(0).toUpperCase() +
          format(inicio, "MMMM", { locale: es }).slice(1),
        ingresos,
        gastos,
        balance,
      })
    }

    return desglose
  }

  const desgloseAnual = obtenerDesgloseAnual()

  // Calcular el total por tipo para el mes actual
  const totalPorTipo = transaccionesFiltradas.reduce((sum, t) => sum + t.monto, 0)

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFiltroMes(new Date(getYear(filtroMes) - 1, 0, 1))}
            aria-label="Año anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-[100px] px-3 py-2 rounded-md border bg-muted/40 flex justify-between items-center">
            <span className="font-medium">{getYear(filtroMes)}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFiltroMes(new Date(getYear(filtroMes) + 1, 0, 1))}
            aria-label="Año siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Badge variant="outline" className="font-normal">
          Vista anual
        </Badge>
      </div>

      {/* Tarjeta de resumen global */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Resumen financiero {añoActual}</CardTitle>
          <CardDescription>Visión general de tus finanzas en el año actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  Total ingresos
                </span>
                <span className="text-lg font-bold text-green-500">{formatCurrency(totalIngresosAñoActual)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  Total gastos
                </span>
                <span className="text-lg font-bold text-red-500">{formatCurrency(totalGastosAñoActual)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saldo neto</span>
                <span className={`text-xl font-bold ${saldoNetoAñoActual >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(saldoNetoAñoActual)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center h-full">
                    <DollarSign className="h-6 w-6 text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Promedio mensual</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(promedioIngresosMensual - promedioGastosMensual)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center h-full">
                    <Calendar className="h-6 w-6 text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Meses analizados</p>
                    <p className="text-lg font-bold">{mesesTranscurridos}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas clave con resúmenes anuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-3">
                <ArrowUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total ingresos anuales</h3>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIngresosAñoActual)}</p>
              <div className="flex items-center mt-2">
                {cambioIngresos > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${cambioIngresos >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {cambioIngresos.toFixed(1)}% vs {añoAnterior}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mb-3">
                <ArrowDown className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total egresos anuales</h3>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalGastosAñoActual)}</p>
              <div className="flex items-center mt-2">
                {cambioGastos < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${cambioGastos <= 0 ? "text-green-500" : "text-red-500"}`}>
                  {cambioGastos.toFixed(1)}% vs {añoAnterior}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Saldo neto del año</h3>
              <p className={`text-2xl font-bold ${saldoNetoAñoActual >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(saldoNetoAñoActual)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {((saldoNetoAñoActual / totalIngresosAñoActual) * 100).toFixed(0)}% de los ingresos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full mb-3">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Promedio mensual</h3>
              <p className="text-2xl font-bold text-blue-500">
                {formatCurrency(promedioIngresosMensual - promedioGastosMensual)}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  Basado en {mesesTranscurridos} {mesesTranscurridos === 1 ? "mes" : "meses"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="gasto"
        onValueChange={(value) => setTipoActivo(value as TipoTransaccion)}
        className="w-full mb-6"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="ingreso">Ingresos</TabsTrigger>
          <TabsTrigger value="gasto">Gastos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfica de pastel mejorada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tipoActivo === "ingreso" ? "Ingresos" : "Gastos"} por categoría</CardTitle>
            <CardDescription>
              Distribución de {tipoActivo === "ingreso" ? "ingresos" : "gastos"} del mes actual
            </CardDescription>
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
                <div className="max-h-[200px] overflow-y-auto pr-2">
                  {datosPorCategoria.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-1 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(item.value)}</span>
                        <Badge variant="outline" className="ml-1">
                          {Math.round((item.value / totalPorTipo) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfica de barras optimizada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparativa mensual</CardTitle>
            <CardDescription>Ingresos vs gastos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {datosComparativos.some((d) => d.ingresos > 0 || d.gastos > 0) ? (
              <div className="h-[300px]">
                <GraficoBarras datos={datosComparativos} />
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No hay datos para mostrar en este período</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de desglose mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Desglose mensual {añoActual}</CardTitle>
          <CardDescription>Resumen de ingresos y gastos por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Gastos</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desgloseAnual.map((mes, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{mes.mes}</TableCell>
                    <TableCell className="text-right text-green-500">{formatCurrency(mes.ingresos)}</TableCell>
                    <TableCell className="text-right text-red-500">{formatCurrency(mes.gastos)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${mes.balance >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {formatCurrency(mes.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
