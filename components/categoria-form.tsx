"use client"

import { useData, type TipoTransaccion } from "./data-provider"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { IconoCategoria } from "./icono-categoria"
import { COLORES_CATEGORIA, ICONOS_CATEGORIA } from "@/lib/constants"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface CategoriaFormProps {
  categoriaId?: string
  tipoInicial?: TipoTransaccion
  onSuccess?: () => void
}

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: z.enum(["ingreso", "gasto"]),
  icono: z.string().min(1, "Selecciona un ícono"),
  color: z.string().min(1, "Selecciona un color"),
})

export function CategoriaForm({ categoriaId, tipoInicial = "gasto", onSuccess }: CategoriaFormProps) {
  const { categorias, agregarCategoria, editarCategoria } = useData()

  const categoria = categoriaId ? categorias.find((c) => c.id === categoriaId) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: categoria?.nombre || "",
      tipo: categoria?.tipo || tipoInicial,
      icono: categoria?.icono || "CreditCard",
      color: categoria?.color || "gray",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (categoriaId) {
      editarCategoria(categoriaId, values)
    } else {
      agregarCategoria(values)
    }
    onSuccess?.()
  }

  const watchIcono = form.watch("icono")
  const watchColor = form.watch("color")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">{categoriaId ? "Editar categoría" : "Nueva categoría"}</h2>

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Salario, Comida, Transporte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="gasto">Gasto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícono</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-6 gap-2"
                  >
                    {ICONOS_CATEGORIA.map((icono) => (
                      <div key={icono} className="flex items-center space-x-2">
                        <RadioGroupItem value={icono} id={`icono-${icono}`} className="sr-only" />
                        <Label
                          htmlFor={`icono-${icono}`}
                          className={`flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-muted ${
                            field.value === icono ? "border-primary bg-primary/10" : "border-muted"
                          }`}
                        >
                          <IconoCategoria icono={icono} color={watchColor} size={24} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-6 gap-2"
                  >
                    {COLORES_CATEGORIA.map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className={`flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-muted ${
                            field.value === color ? "border-primary" : "border-muted"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-${color}-500`}></div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <div className="border border-muted p-4 rounded-md">
              <div className="text-center mb-2">Vista previa</div>
              <div className="flex items-center gap-2">
                <IconoCategoria icono={watchIcono} color={watchColor} size={24} />
                <span>{form.watch("nombre") || "Nombre de categoría"}</span>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          {categoriaId ? "Guardar cambios" : "Agregar categoría"}
        </Button>
      </form>
    </Form>
  )
}
