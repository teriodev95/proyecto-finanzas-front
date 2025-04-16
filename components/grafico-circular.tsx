"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface DatoGrafico {
  id: string
  label: string
  value: number
  color: string
}

interface GraficoCircularProps {
  datos: DatoGrafico[]
}

export function GraficoCircular({ datos }: GraficoCircularProps) {
  const getColor = (color: string) => {
    switch (color) {
      case "red":
        return "#ef4444"
      case "green":
        return "#10b981"
      case "blue":
        return "#3b82f6"
      case "yellow":
        return "#f59e0b"
      case "purple":
        return "#8b5cf6"
      case "pink":
        return "#ec4899"
      case "indigo":
        return "#6366f1"
      case "orange":
        return "#f97316"
      case "teal":
        return "#14b8a6"
      case "emerald":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={datos}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="label"
        >
          {datos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
