"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
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
      const data = payload[0].payload
      const porcentaje = ((data.value / datos.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)

      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.label}</p>
          <p className="text-primary">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{porcentaje}% del total</p>
        </div>
      )
    }
    return null
  }

  // Función para renderizar etiquetas personalizadas
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Solo mostrar etiquetas para segmentos con porcentaje significativo
    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill={getColor(datos[index].color)}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Renderizar leyenda personalizada
  const renderCustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs">{entry.value}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={datos}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="label"
          animationDuration={800}
          animationBegin={0}
        >
          {datos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.color)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderCustomLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
}
