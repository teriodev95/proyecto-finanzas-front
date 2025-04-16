"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

// Definición de tipos
export type TipoTransaccion = "ingreso" | "gasto"

export interface Transaccion {
  id: string
  tipo: TipoTransaccion
  monto: number
  categoriaId: string
  cuentaId: string
  fecha: string
  notas?: string
}

export interface Categoria {
  id: string
  nombre: string
  tipo: TipoTransaccion
  icono: string
  color: string
}

export interface Cuenta {
  id: string
  nombre: string
  saldo: number
}

// Actualizar la interfaz DataContextType para incluir "acerca-de" como posible valor para paginaActual

export interface DataContextType {
  transacciones: Transaccion[]
  categorias: Categoria[]
  cuentas: Cuenta[]
  paginaActual: string // Puede ser "transacciones", "cuentas", "categorias", "informes" o "acerca-de"
  setPaginaActual: (pagina: string) => void
  filtroMes: Date
  setFiltroMes: (fecha: Date) => void
  agregarTransaccion: (transaccion: Omit<Transaccion, "id">) => void
  editarTransaccion: (id: string, transaccion: Omit<Transaccion, "id">) => void
  eliminarTransaccion: (id: string) => void
  agregarCategoria: (categoria: Omit<Categoria, "id">) => void
  editarCategoria: (id: string, categoria: Omit<Categoria, "id">) => void
  eliminarCategoria: (id: string) => void
  agregarCuenta: (cuenta: Omit<Cuenta, "id">) => void
  editarCuenta: (id: string, cuenta: Omit<Cuenta, "id">) => void
  eliminarCuenta: (id: string) => void
  resetearDatos: () => void
  obtenerSaldoTotal: () => number
  obtenerIngresosTotales: () => number
  obtenerGastosTotales: () => number
  obtenerBalance: () => number
  obtenerTransaccionesFiltradas: () => Transaccion[]
}

// Categorías predeterminadas
const categoriasDefault: Categoria[] = [
  {
    id: "cat-ingreso-1",
    nombre: "Salario",
    tipo: "ingreso",
    icono: "Briefcase",
    color: "green",
  },
  {
    id: "cat-ingreso-2",
    nombre: "Inversiones",
    tipo: "ingreso",
    icono: "TrendingUp",
    color: "emerald",
  },
  {
    id: "cat-gasto-1",
    nombre: "Comida",
    tipo: "gasto",
    icono: "Utensils",
    color: "red",
  },
  {
    id: "cat-gasto-2",
    nombre: "Transporte",
    tipo: "gasto",
    icono: "Car",
    color: "orange",
  },
  {
    id: "cat-gasto-3",
    nombre: "Entretenimiento",
    tipo: "gasto",
    icono: "Film",
    color: "purple",
  },
]

// Cuentas predeterminadas
const cuentasDefault: Cuenta[] = [
  {
    id: "cuenta-1",
    nombre: "Efectivo",
    saldo: 5000,
  },
  {
    id: "cuenta-2",
    nombre: "Banco",
    saldo: 25350,
  },
]

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasDefault)
  const [cuentas, setCuentas] = useState<Cuenta[]>(cuentasDefault)
  const [paginaActual, setPaginaActual] = useState<string>("transacciones")
  const [filtroMes, setFiltroMes] = useState<Date>(new Date())

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTransacciones = localStorage.getItem("transacciones")
        const storedCategorias = localStorage.getItem("categorias")
        const storedCuentas = localStorage.getItem("cuentas")

        if (storedTransacciones) {
          setTransacciones(JSON.parse(storedTransacciones))
        }

        if (storedCategorias) {
          setCategorias(JSON.parse(storedCategorias))
        } else {
          setCategorias(categoriasDefault)
        }

        if (storedCuentas) {
          setCuentas(JSON.parse(storedCuentas))
        } else {
          setCuentas(cuentasDefault)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        resetearDatos()
      }
    }

    loadData()
  }, [])

  // Guardar datos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("transacciones", JSON.stringify(transacciones))
  }, [transacciones])

  useEffect(() => {
    localStorage.setItem("categorias", JSON.stringify(categorias))
  }, [categorias])

  useEffect(() => {
    localStorage.setItem("cuentas", JSON.stringify(cuentas))
  }, [cuentas])

  // Funciones para manipular transacciones
  const agregarTransaccion = (transaccion: Omit<Transaccion, "id">) => {
    const nuevaTransaccion = {
      ...transaccion,
      id: uuidv4(),
    }
    setTransacciones([...transacciones, nuevaTransaccion])

    // Actualizar saldo de la cuenta
    const cuenta = cuentas.find((c) => c.id === transaccion.cuentaId)
    if (cuenta) {
      const nuevoSaldo =
        transaccion.tipo === "ingreso" ? cuenta.saldo + transaccion.monto : cuenta.saldo - transaccion.monto
      editarCuenta(cuenta.id, { ...cuenta, saldo: nuevoSaldo })
    }
  }

  const editarTransaccion = (id: string, transaccionActualizada: Omit<Transaccion, "id">) => {
    const transaccionAnterior = transacciones.find((t) => t.id === id)
    if (!transaccionAnterior) return

    // Revertir el efecto de la transacción anterior en la cuenta
    const cuentaAnterior = cuentas.find((c) => c.id === transaccionAnterior.cuentaId)
    if (cuentaAnterior) {
      const saldoRevertido =
        transaccionAnterior.tipo === "ingreso"
          ? cuentaAnterior.saldo - transaccionAnterior.monto
          : cuentaAnterior.saldo + transaccionAnterior.monto
      editarCuenta(cuentaAnterior.id, {
        ...cuentaAnterior,
        saldo: saldoRevertido,
      })
    }

    // Aplicar el efecto de la transacción actualizada
    const cuentaNueva = cuentas.find((c) => c.id === transaccionActualizada.cuentaId)
    if (cuentaNueva) {
      const nuevoSaldo =
        transaccionActualizada.tipo === "ingreso"
          ? cuentaNueva.saldo + transaccionActualizada.monto
          : cuentaNueva.saldo - transaccionActualizada.monto
      editarCuenta(cuentaNueva.id, { ...cuentaNueva, saldo: nuevoSaldo })
    }

    // Actualizar la transacción
    setTransacciones(transacciones.map((t) => (t.id === id ? { ...transaccionActualizada, id } : t)))
  }

  const eliminarTransaccion = (id: string) => {
    const transaccion = transacciones.find((t) => t.id === id)
    if (!transaccion) return

    // Revertir el efecto de la transacción en la cuenta
    const cuenta = cuentas.find((c) => c.id === transaccion.cuentaId)
    if (cuenta) {
      const nuevoSaldo =
        transaccion.tipo === "ingreso" ? cuenta.saldo - transaccion.monto : cuenta.saldo + transaccion.monto
      editarCuenta(cuenta.id, { ...cuenta, saldo: nuevoSaldo })
    }

    // Eliminar la transacción
    setTransacciones(transacciones.filter((t) => t.id !== id))
  }

  // Funciones para manipular categorías
  const agregarCategoria = (categoria: Omit<Categoria, "id">) => {
    const nuevaCategoria = {
      ...categoria,
      id: uuidv4(),
    }
    setCategorias([...categorias, nuevaCategoria])
  }

  const editarCategoria = (id: string, categoriaActualizada: Omit<Categoria, "id">) => {
    setCategorias(categorias.map((c) => (c.id === id ? { ...categoriaActualizada, id } : c)))
  }

  const eliminarCategoria = (id: string) => {
    // Verificar si hay transacciones que usan esta categoría
    const tieneTransacciones = transacciones.some((t) => t.categoriaId === id)
    if (tieneTransacciones) {
      alert("No se puede eliminar esta categoría porque hay transacciones que la utilizan.")
      return
    }
    setCategorias(categorias.filter((c) => c.id !== id))
  }

  // Funciones para manipular cuentas
  const agregarCuenta = (cuenta: Omit<Cuenta, "id">) => {
    const nuevaCuenta = {
      ...cuenta,
      id: uuidv4(),
    }
    setCuentas([...cuentas, nuevaCuenta])
  }

  const editarCuenta = (id: string, cuentaActualizada: Omit<Cuenta, "id">) => {
    setCuentas(cuentas.map((c) => (c.id === id ? { ...cuentaActualizada, id } : c)))
  }

  const eliminarCuenta = (id: string) => {
    // Verificar si hay transacciones que usan esta cuenta
    const tieneTransacciones = transacciones.some((t) => t.cuentaId === id)
    if (tieneTransacciones) {
      alert("No se puede eliminar esta cuenta porque hay transacciones que la utilizan.")
      return
    }
    setCuentas(cuentas.filter((c) => c.id !== id))
  }

  // Función para resetear todos los datos
  const resetearDatos = () => {
    setTransacciones([])
    setCategorias(categoriasDefault)
    setCuentas(cuentasDefault)
    localStorage.removeItem("transacciones")
    localStorage.removeItem("categorias")
    localStorage.removeItem("cuentas")
  }

  // Funciones para obtener resúmenes financieros
  const obtenerTransaccionesFiltradas = () => {
    // Crear fecha de inicio (primer día del mes)
    const inicio = new Date(filtroMes.getFullYear(), filtroMes.getMonth(), 1)
    // Crear fecha de fin (último día del mes)
    const fin = new Date(filtroMes.getFullYear(), filtroMes.getMonth() + 1, 0)

    return transacciones.filter((t) => {
      const fechaTransaccion = new Date(t.fecha)
      return fechaTransaccion >= inicio && fechaTransaccion <= fin
    })
  }

  const obtenerSaldoTotal = () => {
    return cuentas.reduce((total, cuenta) => total + cuenta.saldo, 0)
  }

  const obtenerIngresosTotales = () => {
    const transaccionesFiltradas = obtenerTransaccionesFiltradas()
    return transaccionesFiltradas.filter((t) => t.tipo === "ingreso").reduce((total, t) => total + t.monto, 0)
  }

  const obtenerGastosTotales = () => {
    const transaccionesFiltradas = obtenerTransaccionesFiltradas()
    return transaccionesFiltradas.filter((t) => t.tipo === "gasto").reduce((total, t) => total + t.monto, 0)
  }

  const obtenerBalance = () => {
    return obtenerIngresosTotales() - obtenerGastosTotales()
  }

  const value = {
    transacciones,
    categorias,
    cuentas,
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
    resetearDatos,
    obtenerSaldoTotal,
    obtenerIngresosTotales,
    obtenerGastosTotales,
    obtenerBalance,
    obtenerTransaccionesFiltradas,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// Hook personalizado para usar el contexto
export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData debe ser usado dentro de un DataProvider")
  }
  return context
}
