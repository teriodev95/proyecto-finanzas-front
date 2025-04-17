"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface DatoGrafico {
  name: string
  ingresos: number
  gastos: number
}

interface GraficoBarrasProps {
  datos: DatoGrafico[]
}

export function GraficoBarras({ datos }: GraficoBarrasProps) {
  // Calcular el promedio de ingresos y gastos
  const promedioIngresos = datos.reduce((sum, item) => sum + item.ingresos, 0) / datos.length
  const promedioGastos = datos.reduce((sum, item) => sum + item.gastos, 0) / datos.length

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const ingresos = payload.find((p: any) => p.name === "ingresos")?.value || 0
      const gastos = payload.find((p: any) => p.name === "gastos")?.value || 0
      const balance = ingresos - gastos

      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-green-500">Ingresos:</span>
              <span className="font-medium">{formatCurrency(ingresos)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-red-500">Gastos:</span>
              <span className="font-medium">{formatCurrency(gastos)}</span>
            </p>
            <div className="border-t border-border my-1 pt-1">
              <p className="flex justify-between gap-4">
                <span>Balance:</span>
                <span className={`font-medium ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(balance)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    // Verificar que payload existe y es un array antes de usar map
    if (!payload || !Array.isArray(payload)) {
      return null
    }

    return (
      <div className="flex justify-center gap-6 mt-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs">{entry.value === "ingresos" ? "Ingresos" : "Gastos"}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={datos}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => (value === 0 ? "0" : `${(value / 1000).toFixed(0)}k`)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <ReferenceLine y={promedioIngresos} stroke="#10b981" strokeDasharray="3 3" />
        <ReferenceLine y={promedioGastos} stroke="#ef4444" strokeDasharray="3 3" />
        <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
