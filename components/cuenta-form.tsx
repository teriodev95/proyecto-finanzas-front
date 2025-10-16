"use client"

import { useData } from "./api-data-provider"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface CuentaFormProps {
  cuentaId?: string
  onSuccess?: () => void
}

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  saldo: z.coerce.number(),
})

export function CuentaForm({ cuentaId, onSuccess }: CuentaFormProps) {
  const { cuentas, agregarCuenta, editarCuenta } = useData()

  const cuenta = cuentaId ? cuentas.find((c) => c.id === cuentaId) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: cuenta?.nombre || "",
      saldo: cuenta?.saldo || 0,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (cuentaId) {
      editarCuenta(cuentaId, values)
    } else {
      agregarCuenta(values)
    }
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">{cuentaId ? "Editar cuenta" : "Nueva cuenta"}</h2>

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Efectivo, Banco, Ahorros" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saldo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo inicial</FormLabel>
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
        </div>

        <Button type="submit" className="w-full">
          {cuentaId ? "Guardar cambios" : "Agregar cuenta"}
        </Button>
      </form>
    </Form>
  )
}
