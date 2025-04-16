"use client"

import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Car,
  CreditCard,
  Film,
  Gift,
  HelpCircle,
  Home,
  type LucideIcon,
  ShoppingBag,
  Utensils,
  Wallet,
  Zap,
  TrendingUp,
  Plane,
  Heart,
  Smartphone,
  Coffee,
} from "lucide-react"

interface IconoCategoriaProps {
  icono: string
  color: string
  size?: number
}

export function IconoCategoria({ icono, color, size = 20 }: IconoCategoriaProps) {
  const getIcono = (): LucideIcon => {
    switch (icono) {
      case "Briefcase":
        return Briefcase
      case "Car":
        return Car
      case "CreditCard":
        return CreditCard
      case "Film":
        return Film
      case "Gift":
        return Gift
      case "Home":
        return Home
      case "ShoppingBag":
        return ShoppingBag
      case "Utensils":
        return Utensils
      case "Wallet":
        return Wallet
      case "Zap":
        return Zap
      case "TrendingUp":
        return TrendingUp
      case "Plane":
        return Plane
      case "Heart":
        return Heart
      case "Smartphone":
        return Smartphone
      case "Coffee":
        return Coffee
      case "ArrowUp":
        return ArrowUp
      case "ArrowDown":
        return ArrowDown
      default:
        return HelpCircle
    }
  }

  const getColorClass = () => {
    switch (color) {
      case "red":
        return "text-red-500"
      case "green":
        return "text-green-500"
      case "blue":
        return "text-blue-500"
      case "yellow":
        return "text-yellow-500"
      case "purple":
        return "text-purple-500"
      case "pink":
        return "text-pink-500"
      case "indigo":
        return "text-indigo-500"
      case "orange":
        return "text-orange-500"
      case "teal":
        return "text-teal-500"
      case "emerald":
        return "text-emerald-500"
      default:
        return "text-gray-500"
    }
  }

  const getBackgroundClass = () => {
    switch (color) {
      case "red":
        return "bg-red-100 dark:bg-red-900/20"
      case "green":
        return "bg-green-100 dark:bg-green-900/20"
      case "blue":
        return "bg-blue-100 dark:bg-blue-900/20"
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/20"
      case "purple":
        return "bg-purple-100 dark:bg-purple-900/20"
      case "pink":
        return "bg-pink-100 dark:bg-pink-900/20"
      case "indigo":
        return "bg-indigo-100 dark:bg-indigo-900/20"
      case "orange":
        return "bg-orange-100 dark:bg-orange-900/20"
      case "teal":
        return "bg-teal-100 dark:bg-teal-900/20"
      case "emerald":
        return "bg-emerald-100 dark:bg-emerald-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  const Icon = getIcono()

  return (
    <div
      className={`flex items-center justify-center rounded-full ${getBackgroundClass()}`}
      style={{ width: size * 1.8, height: size * 1.8 }}
    >
      <Icon className={`${getColorClass()}`} size={size} />
    </div>
  )
}
