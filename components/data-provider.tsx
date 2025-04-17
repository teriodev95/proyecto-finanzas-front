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

// Categorías predeterminadas adaptadas al contexto mexicano
const categoriasDefault: Categoria[] = [
  // Categorías de ingreso
  {
    id: "cat-ingreso-1",
    nombre: "Salario",
    tipo: "ingreso",
    icono: "Briefcase",
    color: "green",
  },
  {
    id: "cat-ingreso-2",
    nombre: "Honorarios/Freelance",
    tipo: "ingreso",
    icono: "TrendingUp",
    color: "emerald",
  },
  {
    id: "cat-ingreso-3",
    nombre: "Venta por apps",
    tipo: "ingreso",
    icono: "Smartphone",
    color: "blue",
  },
  {
    id: "cat-ingreso-4",
    nombre: "Apoyos gubernamentales",
    tipo: "ingreso",
    icono: "Home",
    color: "teal",
  },
  {
    id: "cat-ingreso-5",
    nombre: "Remesas",
    tipo: "ingreso",
    icono: "ArrowUp",
    color: "indigo",
  },
  {
    id: "cat-ingreso-6",
    nombre: "Bonos",
    tipo: "ingreso",
    icono: "Gift",
    color: "purple",
  },

  // Categorías de gasto
  {
    id: "cat-gasto-1",
    nombre: "Despensa/Súper",
    tipo: "gasto",
    icono: "ShoppingBag",
    color: "red",
  },
  {
    id: "cat-gasto-2",
    nombre: "Comida a domicilio",
    tipo: "gasto",
    icono: "Utensils",
    color: "orange",
  },
  {
    id: "cat-gasto-3",
    nombre: "Transporte público",
    tipo: "gasto",
    icono: "Car",
    color: "yellow",
  },
  {
    id: "cat-gasto-4",
    nombre: "Gasolina",
    tipo: "gasto",
    icono: "Zap",
    color: "purple",
  },
  {
    id: "cat-gasto-5",
    nombre: "Servicios",
    tipo: "gasto",
    icono: "Home",
    color: "blue",
  },
  {
    id: "cat-gasto-6",
    nombre: "Internet/Telefonía",
    tipo: "gasto",
    icono: "Smartphone",
    color: "teal",
  },
  {
    id: "cat-gasto-7",
    nombre: "Renta/Hipoteca",
    tipo: "gasto",
    icono: "Home",
    color: "indigo",
  },
  {
    id: "cat-gasto-8",
    nombre: "Entretenimiento",
    tipo: "gasto",
    icono: "Film",
    color: "pink",
  },
  {
    id: "cat-gasto-9",
    nombre: "Salud",
    tipo: "gasto",
    icono: "Heart",
    color: "emerald",
  },
  {
    id: "cat-gasto-10",
    nombre: "Educación",
    tipo: "gasto",
    icono: "Briefcase",
    color: "blue",
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

// Datos de prueba para el mes de abril
const transaccionesDefault: Omit<Transaccion, "id">[] = [
  // Ingresos
  {
    tipo: "ingreso",
    monto: 15000,
    categoriaId: "cat-ingreso-1", // Salario
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-01",
    notas: "Quincena primera de abril",
  },
  {
    tipo: "ingreso",
    monto: 15000,
    categoriaId: "cat-ingreso-1", // Salario
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-15",
    notas: "Quincena segunda de abril",
  },
  {
    tipo: "ingreso",
    monto: 2500,
    categoriaId: "cat-ingreso-2", // Honorarios/Freelance
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-05",
    notas: "Proyecto de diseño web",
  },
  {
    tipo: "ingreso",
    monto: 1800,
    categoriaId: "cat-ingreso-3", // Venta por apps
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-08",
    notas: "Venta de ropa usada en Marketplace",
  },
  {
    tipo: "ingreso",
    monto: 3200,
    categoriaId: "cat-ingreso-4", // Apoyos gubernamentales
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-10",
    notas: "Apoyo Bienestar",
  },
  {
    tipo: "ingreso",
    monto: 5000,
    categoriaId: "cat-ingreso-5", // Remesas
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-12",
    notas: "Envío familiar del extranjero",
  },
  {
    tipo: "ingreso",
    monto: 3000,
    categoriaId: "cat-ingreso-2", // Honorarios/Freelance
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-18",
    notas: "Consultoría de marketing",
  },
  {
    tipo: "ingreso",
    monto: 1200,
    categoriaId: "cat-ingreso-3", // Venta por apps
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-22",
    notas: "Venta de libros usados",
  },
  {
    tipo: "ingreso",
    monto: 4500,
    categoriaId: "cat-ingreso-6", // Bonos
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-25",
    notas: "Bono por desempeño trimestral",
  },
  {
    tipo: "ingreso",
    monto: 2800,
    categoriaId: "cat-ingreso-2", // Honorarios/Freelance
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-28",
    notas: "Proyecto de traducción",
  },

  // Gastos - Semana 1
  {
    tipo: "gasto",
    monto: 1850,
    categoriaId: "cat-gasto-1", // Despensa/Súper
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-01",
    notas: "Compra semanal en Soriana",
  },
  {
    tipo: "gasto",
    monto: 320,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-01",
    notas: "Pedido en Rappi",
  },
  {
    tipo: "gasto",
    monto: 150,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-02",
    notas: "Recarga tarjeta Metro",
  },
  {
    tipo: "gasto",
    monto: 800,
    categoriaId: "cat-gasto-4", // Gasolina
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-02",
    notas: "Tanque lleno Pemex",
  },
  {
    tipo: "gasto",
    monto: 250,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-03",
    notas: "Tacos por Didi Food",
  },
  {
    tipo: "gasto",
    monto: 450,
    categoriaId: "cat-gasto-8", // Entretenimiento
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-03",
    notas: "Boletos de cine",
  },
  {
    tipo: "gasto",
    monto: 120,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-04",
    notas: "Uber al trabajo",
  },
  {
    tipo: "gasto",
    monto: 350,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-04",
    notas: "Comida china a domicilio",
  },
  {
    tipo: "gasto",
    monto: 2500,
    categoriaId: "cat-gasto-5", // Servicios
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-05",
    notas: "Pago recibo CFE bimestral",
  },
  {
    tipo: "gasto",
    monto: 180,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-05",
    notas: "Desayuno en cafetería",
  },

  // Gastos - Semana 2
  {
    tipo: "gasto",
    monto: 1650,
    categoriaId: "cat-gasto-1", // Despensa/Súper
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-08",
    notas: "Compra semanal en Walmart",
  },
  {
    tipo: "gasto",
    monto: 899,
    categoriaId: "cat-gasto-6", // Internet/Telefonía
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-08",
    notas: "Pago mensual Telmex",
  },
  {
    tipo: "gasto",
    monto: 200,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-09",
    notas: "Pasajes de la semana",
  },
  {
    tipo: "gasto",
    monto: 750,
    categoriaId: "cat-gasto-4", // Gasolina
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-09",
    notas: "Gasolina Magna",
  },
  {
    tipo: "gasto",
    monto: 380,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-10",
    notas: "Comida en restaurante con compañeros",
  },
  {
    tipo: "gasto",
    monto: 1200,
    categoriaId: "cat-gasto-9", // Salud
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-10",
    notas: "Consulta médica y medicamentos",
  },
  {
    tipo: "gasto",
    monto: 150,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-11",
    notas: "Uber al médico",
  },
  {
    tipo: "gasto",
    monto: 6500,
    categoriaId: "cat-gasto-7", // Renta/Hipoteca
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-12",
    notas: "Pago mensual de renta",
  },

  // Gastos - Semana 3
  {
    tipo: "gasto",
    monto: 1750,
    categoriaId: "cat-gasto-1", // Despensa/Súper
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-15",
    notas: "Compra semanal en Chedraui",
  },
  {
    tipo: "gasto",
    monto: 350,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-15",
    notas: "Comida en food court",
  },
  {
    tipo: "gasto",
    monto: 180,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-16",
    notas: "Pasajes de la semana",
  },
  {
    tipo: "gasto",
    monto: 850,
    categoriaId: "cat-gasto-4", // Gasolina
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-16",
    notas: "Gasolina Premium",
  },
  {
    tipo: "gasto",
    monto: 499,
    categoriaId: "cat-gasto-6", // Internet/Telefonía
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-17",
    notas: "Recarga plan celular",
  },
  {
    tipo: "gasto",
    monto: 1500,
    categoriaId: "cat-gasto-10", // Educación
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-17",
    notas: "Curso online de programación",
  },
  {
    tipo: "gasto",
    monto: 280,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-18",
    notas: "Desayuno con amigos",
  },
  {
    tipo: "gasto",
    monto: 650,
    categoriaId: "cat-gasto-8", // Entretenimiento
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-19",
    notas: "Suscripciones streaming",
  },
  {
    tipo: "gasto",
    monto: 420,
    categoriaId: "cat-gasto-5", // Servicios
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-19",
    notas: "Pago servicio de agua",
  },

  // Gastos - Semana 4
  {
    tipo: "gasto",
    monto: 1950,
    categoriaId: "cat-gasto-1", // Despensa/Súper
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-22",
    notas: "Compra semanal en Costco",
  },
  {
    tipo: "gasto",
    monto: 300,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-22",
    notas: "Comida en oficina",
  },
  {
    tipo: "gasto",
    monto: 160,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-23",
    notas: "Pasajes de la semana",
  },
  {
    tipo: "gasto",
    monto: 780,
    categoriaId: "cat-gasto-4", // Gasolina
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-23",
    notas: "Gasolina Magna",
  },
  {
    tipo: "gasto",
    monto: 1800,
    categoriaId: "cat-gasto-9", // Salud
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-24",
    notas: "Análisis clínicos anuales",
  },
  {
    tipo: "gasto",
    monto: 250,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-24",
    notas: "Comida rápida",
  },
  {
    tipo: "gasto",
    monto: 950,
    categoriaId: "cat-gasto-8", // Entretenimiento
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-25",
    notas: "Salida con amigos",
  },
  {
    tipo: "gasto",
    monto: 350,
    categoriaId: "cat-gasto-5", // Servicios
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-26",
    notas: "Recarga gas LP",
  },
  {
    tipo: "gasto",
    monto: 1200,
    categoriaId: "cat-gasto-1", // Despensa/Súper
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-27",
    notas: "Compras de fin de mes",
  },
  {
    tipo: "gasto",
    monto: 2500,
    categoriaId: "cat-gasto-10", // Educación
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-28",
    notas: "Pago mensual universidad",
  },
  {
    tipo: "gasto",
    monto: 780,
    categoriaId: "cat-gasto-4", // Gasolina
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-29",
    notas: "Gasolina fin de mes",
  },
  {
    tipo: "gasto",
    monto: 320,
    categoriaId: "cat-gasto-2", // Comida a domicilio
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-29",
    notas: "Cena de cumpleaños",
  },
  {
    tipo: "gasto",
    monto: 150,
    categoriaId: "cat-gasto-3", // Transporte público
    cuentaId: "cuenta-1", // Efectivo
    fecha: "2025-04-30",
    notas: "Uber al aeropuerto",
  },
  {
    tipo: "gasto",
    monto: 1500,
    categoriaId: "cat-gasto-8", // Entretenimiento
    cuentaId: "cuenta-2", // Banco
    fecha: "2025-04-30",
    notas: "Boletos para concierto",
  },
]

// Crear el contexto
const DataContext = createContext<DataContextType | undefined>(undefined)

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasDefault)
  const [cuentas, setCuentas] = useState<Cuenta[]>(cuentasDefault)
  const [paginaActual, setPaginaActual] = useState<string>("transacciones")
  const [filtroMes, setFiltroMes] = useState<Date>(new Date(2025, 3, 1)) // Abril 2025

  // Función para generar transacciones por defecto con IDs
  const generarTransaccionesDefault = () => {
    return transaccionesDefault.map((t) => ({
      ...t,
      id: uuidv4(),
    }))
  }

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const loadData = () => {
      try {
        const storedTransacciones = localStorage.getItem("transacciones")
        const storedCategorias = localStorage.getItem("categorias")
        const storedCuentas = localStorage.getItem("cuentas")

        if (storedTransacciones) {
          setTransacciones(JSON.parse(storedTransacciones))
        } else {
          // Si no hay transacciones guardadas, cargar los datos de prueba
          setTransacciones(generarTransaccionesDefault())
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
      // Asegurarse de que la fecha se guarde como string en formato YYYY-MM-DD
      fecha: transaccion.fecha,
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

    // Actualizar la transacción, asegurando que la fecha se guarde correctamente
    setTransacciones(
      transacciones.map((t) =>
        t.id === id
          ? {
              ...transaccionActualizada,
              id,
              fecha: transaccionActualizada.fecha,
            }
          : t,
      ),
    )
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
    const transaccionesReset = generarTransaccionesDefault()
    setTransacciones(transaccionesReset)
    setCategorias(categoriasDefault)
    setCuentas(cuentasDefault)
    localStorage.setItem("transacciones", JSON.stringify(transaccionesReset))
    localStorage.setItem("categorias", JSON.stringify(categoriasDefault))
    localStorage.setItem("cuentas", JSON.stringify(cuentasDefault))
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
