"use client"

import { useState } from "react"
import { useData, type TipoTransaccion } from "./api-data-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoriaForm } from "./categoria-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconoCategoria } from "./icono-categoria"

export function CategoriasPage() {
  const { categorias, eliminarCategoria } = useData()
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [alertaEliminacionAbierta, setAlertaEliminacionAbierta] = useState(false)
  const [tipoActivo, setTipoActivo] = useState<TipoTransaccion>("ingreso")
  const [nuevaCategoriaDialogAbierto, setNuevaCategoriaDialogAbierto] = useState(false)

  const handleEliminar = () => {
    if (categoriaSeleccionada) {
      eliminarCategoria(categoriaSeleccionada)
      setCategoriaSeleccionada(null)
      setAlertaEliminacionAbierta(false)
    }
  }

  const handleEditarCategoria = (categoriaId: string) => {
    setCategoriaSeleccionada(categoriaId)
    setDialogAbierto(true)
  }

  const handleCerrarDialogEdicion = () => {
    setDialogAbierto(false)
    // Importante: limpiar la categoría seleccionada después de que el diálogo se haya cerrado
    setTimeout(() => {
      setCategoriaSeleccionada(null)
    }, 100)
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Mis categorías</h2>
        <Dialog open={nuevaCategoriaDialogAbierto} onOpenChange={setNuevaCategoriaDialogAbierto}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setNuevaCategoriaDialogAbierto(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
            </DialogHeader>
            <CategoriaForm tipoInicial={tipoActivo} onSuccess={() => setNuevaCategoriaDialogAbierto(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="ingreso"
        onValueChange={(value) => setTipoActivo(value as TipoTransaccion)}
        className="w-full mb-4"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="ingreso">Ingresos</TabsTrigger>
          <TabsTrigger value="gasto">Gastos</TabsTrigger>
        </TabsList>
        <TabsContent value="ingreso" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {categorias
              .filter((c) => c.tipo === "ingreso")
              .map((categoria) => (
                <Card key={categoria.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <IconoCategoria icono={categoria.icono} color={categoria.color} />
                        <span>{categoria.nombre}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditarCategoria(categoria.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => {
                              setCategoriaSeleccionada(categoria.id)
                              setAlertaEliminacionAbierta(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="gasto" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {categorias
              .filter((c) => c.tipo === "gasto")
              .map((categoria) => (
                <Card key={categoria.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <IconoCategoria icono={categoria.icono} color={categoria.color} />
                        <span>{categoria.nombre}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditarCategoria(categoria.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => {
                              setCategoriaSeleccionada(categoria.id)
                              setAlertaEliminacionAbierta(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogAbierto} onOpenChange={handleCerrarDialogEdicion}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          {categoriaSeleccionada && (
            <CategoriaForm
              categoriaId={categoriaSeleccionada}
              onSuccess={() => {
                setDialogAbierto(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertaEliminacionAbierta} onOpenChange={setAlertaEliminacionAbierta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la categoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
