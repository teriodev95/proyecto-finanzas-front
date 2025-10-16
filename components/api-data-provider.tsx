"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { apiClient, Transaccion as ApiTransaccion, Categoria as ApiCategoria, Cuenta as ApiCuenta } from "@/lib/api"
import { useAuth } from "@/contexts/api-auth-context"

// Tipos adaptados para mantener compatibilidad con el frontend existente
export type TipoTransaccion = "ingreso" | "gasto"

export interface Transaccion {
  id: string
  tipo: TipoTransaccion
  monto: number
  categoriaId: string
  cuentaId: string
  fecha: string
  notas?: string
  fotoComprobanteUrl?: string
  categoria?: {
    id: string
    nombre: string
    tipo: TipoTransaccion
    icono: string
    color: string
  }
  cuenta?: {
    id: string
    nombre: string
    tipo: string
    color: string
    icono: string
  }
}

export interface Categoria {
  id: string
  nombre: string
  tipo: TipoTransaccion
  icono: string
  color: string
  activa?: boolean
}

export interface Cuenta {
  id: string
  nombre: string
  saldo: number
  tipo?: string
  color?: string
  icono?: string
  activa?: boolean
}

export interface DataContextType {
  transacciones: Transaccion[]
  categorias: Categoria[]
  cuentas: Cuenta[]
  loading: boolean
  paginaActual: string
  setPaginaActual: (pagina: string) => void
  filtroMes: Date
  setFiltroMes: (fecha: Date) => void
  agregarTransaccion: (transaccion: Omit<Transaccion, "id">) => Promise<void>
  editarTransaccion: (id: string, transaccion: Omit<Transaccion, "id">) => Promise<void>
  eliminarTransaccion: (id: string) => Promise<void>
  agregarCategoria: (categoria: Omit<Categoria, "id">) => Promise<void>
  editarCategoria: (id: string, categoria: Omit<Categoria, "id">) => Promise<void>
  eliminarCategoria: (id: string) => Promise<void>
  agregarCuenta: (cuenta: Omit<Cuenta, "id">) => Promise<void>
  editarCuenta: (id: string, cuenta: Omit<Cuenta, "id">) => Promise<void>
  eliminarCuenta: (id: string) => Promise<void>
  refreshData: () => Promise<void>
  obtenerSaldoTotal: () => number
  obtenerIngresosTotales: () => number
  obtenerGastosTotales: () => number
  obtenerBalance: () => number
  obtenerTransaccionesFiltradas: () => Transaccion[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [paginaActual, setPaginaActual] = useState("transacciones")
  const [filtroMes, setFiltroMes] = useState(new Date())

  const { user } = useAuth()

  // Función para transformar datos de la API al formato del frontend
  const transformApiTransaccion = (apiTransaccion: ApiTransaccion): Transaccion => ({
    id: apiTransaccion.id,
    tipo: apiTransaccion.tipo,
    monto: apiTransaccion.monto,
    categoriaId: apiTransaccion.categoria.id,
    cuentaId: apiTransaccion.cuenta.id,
    fecha: apiTransaccion.fecha,
    notas: apiTransaccion.notas,
    fotoComprobanteUrl: apiTransaccion.fotoComprobanteUrl,
    categoria: apiTransaccion.categoria,
    cuenta: apiTransaccion.cuenta
  })

  const transformApiCategoria = (apiCategoria: ApiCategoria): Categoria => ({
    id: apiCategoria.id,
    nombre: apiCategoria.nombre,
    tipo: apiCategoria.tipo,
    icono: apiCategoria.icono,
    color: apiCategoria.color,
    activa: apiCategoria.activa
  })

  const transformApiCuenta = (apiCuenta: ApiCuenta): Cuenta => ({
    id: apiCuenta.id,
    nombre: apiCuenta.nombre,
    saldo: apiCuenta.saldo,
    tipo: apiCuenta.tipo,
    color: apiCuenta.color,
    icono: apiCuenta.icono,
    activa: apiCuenta.activa
  })

  // Función para cargar todos los datos
  const refreshData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const [transaccionesData, categoriasData, cuentasData] = await Promise.all([
        apiClient.getTransacciones(),
        apiClient.getCategorias(),
        apiClient.getCuentas()
      ])

      setTransacciones(transaccionesData.transacciones.map(transformApiTransaccion))
      setCategorias(categoriasData.map(transformApiCategoria))
      setCuentas(cuentasData.map(transformApiCuenta))
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      refreshData()
    }
  }, [user, refreshData])

  // Funciones para transacciones
  const agregarTransaccion = async (transaccion: Omit<Transaccion, "id">) => {
    try {
      await apiClient.createTransaccion({
        tipo: transaccion.tipo,
        monto: transaccion.monto,
        categoria_id: transaccion.categoriaId,
        cuenta_id: transaccion.cuentaId,
        fecha: transaccion.fecha,
        notas: transaccion.notas,
        foto_comprobante_url: transaccion.fotoComprobanteUrl
      })
      await refreshData() // Recargar datos para obtener el estado actualizado
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      throw error
    }
  }

  const editarTransaccion = async (id: string, transaccion: Omit<Transaccion, "id">) => {
    try {
      const payload = {
        tipo: transaccion.tipo,
        monto: transaccion.monto,
        categoria_id: transaccion.categoriaId,
        cuenta_id: transaccion.cuentaId,
        fecha: transaccion.fecha,
        notas: transaccion.notas,
        foto_comprobante_url: transaccion.fotoComprobanteUrl
      }

      await apiClient.updateTransaccion(id, payload)
      await refreshData() // Recargar datos para obtener el estado actualizado
    } catch (error) {
      console.error('Error al editar transacción:', error)
      throw error
    }
  }

  const eliminarTransaccion = async (id: string) => {
    try {
      await apiClient.deleteTransaccion(id)
      await refreshData() // Recargar datos para obtener el estado actualizado
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      throw error
    }
  }

  // Funciones para categorías
  const agregarCategoria = async (categoria: Omit<Categoria, "id">) => {
    try {
      await apiClient.createCategoria({
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        icono: categoria.icono,
        color: categoria.color,
      })
      await refreshData()
    } catch (error) {
      console.error('Error al agregar categoría:', error)
      throw error
    }
  }

  const editarCategoria = async (id: string, categoria: Omit<Categoria, "id">) => {
    try {
      await apiClient.updateCategoria(id, {
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        icono: categoria.icono,
        color: categoria.color,
      })
      await refreshData()
    } catch (error) {
      console.error('Error al editar categoría:', error)
      throw error
    }
  }

  const eliminarCategoria = async (id: string) => {
    try {
      await apiClient.deleteCategoria(id)
      await refreshData()
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      throw error
    }
  }

  // Funciones para cuentas
  const agregarCuenta = async (cuenta: Omit<Cuenta, "id">) => {
    try {
      // Nota: Implementar cuando el endpoint esté disponible
      console.log('Agregar cuenta:', cuenta)
      // await apiClient.createCuenta(cuenta)
      // await refreshData()
    } catch (error) {
      console.error('Error al agregar cuenta:', error)
      throw error
    }
  }

  const editarCuenta = async (id: string, cuenta: Omit<Cuenta, "id">) => {
    try {
      // Nota: Implementar cuando el endpoint esté disponible
      console.log('Editar cuenta:', id, cuenta)
      // await apiClient.updateCuenta(id, cuenta)
      // await refreshData()
    } catch (error) {
      console.error('Error al editar cuenta:', error)
      throw error
    }
  }

  const eliminarCuenta = async (id: string) => {
    try {
      // Nota: Implementar cuando el endpoint esté disponible
      console.log('Eliminar cuenta:', id)
      // await apiClient.deleteCuenta(id)
      // await refreshData()
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      throw error
    }
  }

  // Funciones de cálculo (mantienen la misma lógica)
  const obtenerSaldoTotal = () => {
    return cuentas.reduce((total, cuenta) => total + cuenta.saldo, 0)
  }

  const obtenerTransaccionesFiltradas = () => {
    const año = filtroMes.getFullYear()
    const mes = filtroMes.getMonth()

    return transacciones.filter(transaccion => {
      const fechaTransaccion = new Date(transaccion.fecha)
      return fechaTransaccion.getFullYear() === año && fechaTransaccion.getMonth() === mes
    })
  }

  const obtenerIngresosTotales = () => {
    const transaccionesFiltradas = obtenerTransaccionesFiltradas()
    return transaccionesFiltradas
      .filter(t => t.tipo === "ingreso")
      .reduce((total, t) => total + t.monto, 0)
  }

  const obtenerGastosTotales = () => {
    const transaccionesFiltradas = obtenerTransaccionesFiltradas()
    return transaccionesFiltradas
      .filter(t => t.tipo === "gasto")
      .reduce((total, t) => total + t.monto, 0)
  }

  const obtenerBalance = () => {
    return obtenerIngresosTotales() - obtenerGastosTotales()
  }

  const value: DataContextType = {
    transacciones,
    categorias,
    cuentas,
    loading,
    paginaActual,
    setPaginaActual,
    filtroMes,
    setFiltroMes,
    agregarTransaccion,
    editarTransaccion,
    eliminarTransaccion,
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    agregarCuenta,
    editarCuenta,
    eliminarCuenta,
    refreshData,
    obtenerSaldoTotal,
    obtenerIngresosTotales,
    obtenerGastosTotales,
    obtenerBalance,
    obtenerTransaccionesFiltradas
  }

  // Mostrar indicador de carga mientras se cargan los datos iniciales
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}