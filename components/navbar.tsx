"use client"

import { useData } from "./api-data-provider"
import { TransaccionesPage } from "./transacciones-page"
import { CuentasPage } from "./cuentas-page"
import { CategoriasPage } from "./categorias-page"
import { InformesApiPage } from "./informes-api-page"
import { AcercaDePage } from "./acerca-de-page"
import { Settings, Info } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { AuthMenu } from "./auth-menu"
import { BarChart2, CreditCard, Grid, List } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { paginaActual, setPaginaActual } = useData()

  const renderPage = () => {
    switch (paginaActual) {
      case "transacciones":
        return <TransaccionesPage />
      case "cuentas":
        return <CuentasPage />
      case "categorias":
        return <CategoriasPage />
      case "informes":
        return <InformesApiPage />
      case "acerca-de":
        return <AcercaDePage />
      default:
        return <TransaccionesPage />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">
          {paginaActual === "acerca-de" ? "Acerca de" : paginaActual.charAt(0).toUpperCase() + paginaActual.slice(1)}
        </h1>
        <div className="flex items-center gap-2">
          <AuthMenu />
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Configuración</SheetTitle>
                <SheetDescription>Ajustes y opciones de la aplicación</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setPaginaActual("acerca-de")
                  }}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Acerca de
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-auto pb-16">{renderPage()}</div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setPaginaActual("transacciones")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              paginaActual === "transacciones" ? "text-primary border-t-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <List className="h-5 w-5" />
            <span className="text-xs mt-1">Transacciones</span>
          </button>
          <button
            onClick={() => setPaginaActual("cuentas")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              paginaActual === "cuentas" ? "text-primary border-t-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Cuentas</span>
          </button>
          <button
            onClick={() => setPaginaActual("categorias")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              paginaActual === "categorias" ? "text-primary border-t-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <Grid className="h-5 w-5" />
            <span className="text-xs mt-1">Categorías</span>
          </button>
          <button
            onClick={() => setPaginaActual("informes")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              paginaActual === "informes" ? "text-primary border-t-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs mt-1">Informes</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
