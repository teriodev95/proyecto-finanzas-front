"use client"

import { useData, type TipoTransaccion } from "./data-provider"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { IconoCategoria } from "./icono-categoria"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TransaccionFormProps {
  transaccionId?: string
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

export function TransaccionForm({ transaccionId, onSuccess }: TransaccionFormProps) {
  const { transacciones, categorias, cuentas, agregarTransaccion, editarTransaccion } = useData()

  const transaccion = transaccionId ? transacciones.find((t) => t.id === transaccionId) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: transaccion?.tipo || "gasto",
      monto: transaccion?.monto || 0,
      categoriaId: transaccion?.categoriaId || "",
      cuentaId: transaccion?.cuentaId || "",
      fecha: transaccion?.fecha || format(new Date(), "yyyy-MM-dd"),
      notas: transaccion?.notas || "",
    },
  })

  const tipoActual = form.watch("tipo") as TipoTransaccion

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (transaccionId) {
      editarTransaccion(transaccionId, values)
    } else {
      agregarTransaccion(values)
    }
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">
            {transaccionId ? "Editar transacción" : "Nueva transacción"}
          </h2>

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="ingreso">Ingreso</TabsTrigger>
                    <TabsTrigger value="gasto">Gasto</TabsTrigger>
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
                    <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias
                      .filter((c) => c.tipo === tipoActual)
                      .map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <IconoCategoria icono={categoria.icono} color={categoria.color} size={16} />
                            <span>{categoria.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <Button type="submit" className="w-full">
          {transaccionId ? "Guardar cambios" : "Agregar transacción"}
        </Button>
      </form>
    </Form>
  )
}
