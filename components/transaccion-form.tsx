"use client"

import { useData, type TipoTransaccion } from "./data-provider"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { IconoCategoria } from "./icono-categoria"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SelectionChip } from "./ui/selection-chip"
import { ScrollArea } from "./ui/scroll-area"
import { useRef, useEffect } from "react"

interface TransaccionFormProps {
  transaccionId?: string
  tipoInicial?: TipoTransaccion
  onSuccess?: () => void
}

const formSchema = z.object({
  tipo: z.enum(["ingreso", "gasto"]),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0").min(0.01, "El monto debe ser mayor a 0"),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  cuentaId: z.string().min(1, "Selecciona una cuenta"),
  fecha: z.string().min(1, "Selecciona una fecha"),
  notas: z.string().optional(),
})

export function TransaccionForm({ transaccionId, tipoInicial = "gasto", onSuccess }: TransaccionFormProps) {
  const { transacciones, categorias, cuentas, agregarTransaccion, editarTransaccion } = useData()
  const montoInputRef = useRef<HTMLInputElement>(null)

  const transaccion = transaccionId ? transacciones.find((t) => t.id === transaccionId) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: transaccion?.tipo || tipoInicial,
      monto: transaccion ? transaccion.monto : "", // Usar cadena vacía para campo vacío pero controlado
      categoriaId: transaccion?.categoriaId || "",
      cuentaId: transaccion?.cuentaId || "",
      fecha: transaccion?.fecha || format(new Date(), "yyyy-MM-dd"),
      notas: transaccion?.notas || "",
    },
  })

  // Efecto para enfocar el campo de monto al abrir el modal
  useEffect(() => {
    // Pequeño timeout para asegurar que el modal esté completamente abierto
    const timer = setTimeout(() => {
      if (montoInputRef.current) {
        montoInputRef.current.focus()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const tipoActual = form.watch("tipo") as TipoTransaccion
  const categoriaIdSeleccionada = form.watch("categoriaId")
  const cuentaIdSeleccionada = form.watch("cuentaId")

  // Modificar la función onSubmit para asegurar que la fecha se guarde correctamente
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Asegurarse de que la fecha se guarde en formato YYYY-MM-DD sin ajustes de zona horaria
    const formattedValues = {
      ...values,
      fecha: values.fecha, // Ya está en formato YYYY-MM-DD desde el input type="date"
    }

    if (transaccionId) {
      editarTransaccion(transaccionId, formattedValues)
    } else {
      agregarTransaccion(formattedValues)
    }
    onSuccess?.()
  }

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipoActual)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">
            {transaccionId ? "Editar transacción" : tipoActual === "ingreso" ? "Nuevo ingreso" : "Nuevo gasto"}
          </h2>

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger
                      value="ingreso"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:text-green-500"
                    >
                      Ingreso
                    </TabsTrigger>
                    <TabsTrigger
                      value="gasto"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500"
                    >
                      Gasto
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.00"
                      className="pl-7"
                      ref={montoInputRef}
                      value={field.value === "" ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === "" ? "" : value)
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <ScrollArea className="h-32 w-full rounded-md border p-2">
                      <div className="flex flex-wrap gap-2 pb-2">
                        {categoriasFiltradas.map((categoria) => (
                          <SelectionChip
                            key={categoria.id}
                            selected={field.value === categoria.id}
                            onClick={() => form.setValue("categoriaId", categoria.id)}
                          >
                            <IconoCategoria icono={categoria.icono} color={categoria.color} size={16} />
                            <span>{categoria.nombre}</span>
                          </SelectionChip>
                        ))}
                      </div>
                    </ScrollArea>
                    {categoriasFiltradas.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No hay categorías disponibles para este tipo de transacción
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuentaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuenta</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {cuentas.map((cuenta) => (
                      <SelectionChip
                        key={cuenta.id}
                        selected={field.value === cuenta.id}
                        onClick={() => form.setValue("cuentaId", cuenta.id)}
                      >
                        {cuenta.nombre}
                      </SelectionChip>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Añade detalles sobre esta transacción" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className={`w-full ${
            tipoActual === "ingreso"
              ? "border-green-500 text-green-500 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50"
              : "border-red-500 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50"
          }`}
          variant="outline"
        >
          {transaccionId ? "Guardar cambios" : tipoActual === "ingreso" ? "Registrar ingreso" : "Registrar gasto"}
        </Button>
      </form>
    </Form>
  )
}
