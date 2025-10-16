"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, DollarSign, Calendar, BarChart3, ArrowDown, ArrowUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { apiClient, ResumenFinanciero } from "@/lib/api"

export function InformesApiPage() {
  const [añoActual, setAñoActual] = useState(new Date().getFullYear())
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null)
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const [resumenData, gastosData] = await Promise.all([
          apiClient.getResumenFinanciero(añoActual),
          apiClient.getGastosPorCategoria(añoActual)
        ])

        setResumen(resumenData)
        setGastosPorCategoria(gastosData)
      } catch (error) {
        console.error('Error al cargar informes:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [añoActual])

  const cambiarAño = (direccion: 'anterior' | 'siguiente') => {
    setAñoActual(prev => direccion === 'anterior' ? prev - 1 : prev + 1)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!resumen) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <div className="text-center text-muted-foreground">
          No hay datos disponibles para mostrar informes.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Selector de año */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => cambiarAño('anterior')}
          className="rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{añoActual}</h2>
          <p className="text-sm text-muted-foreground">Vista anual</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => cambiarAño('siguiente')}
          className="rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Resumen financiero principal */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Resumen financiero {añoActual}</CardTitle>
          <CardDescription>
            Visión general de tus finanzas en el año actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ingresos y gastos */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Total ingresos</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(resumen.total_ingresos)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Total gastos</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(resumen.total_gastos)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Saldo neto</span>
              </div>
              <span className={`text-lg font-bold ${resumen.saldo_neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(resumen.saldo_neto)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Promedio mensual</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(resumen.promedio_mensual)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Meses analizados</p>
              <p className="text-xl font-bold text-purple-600">
                {resumen.meses_analizados}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saldo total de cuentas */}
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo total cuentas</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(resumen.saldo_total_cuentas)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de gastos por categoría */}
      {gastosPorCategoria.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Gastos por categoría</CardTitle>
            <CardDescription>
              Desglose de gastos del año {añoActual}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gastosPorCategoria.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-${categoria.color}-500`}></div>
                  <span className="text-sm font-medium">{categoria.nombre}</span>
                </div>
                <span className="text-sm font-bold text-red-600">
                  {formatCurrency(categoria.total)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}