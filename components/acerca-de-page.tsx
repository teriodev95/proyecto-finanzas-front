"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "./separator"
import { ExportarImportarDatos } from "./exportar-importar-datos"
import { Github, ExternalLink, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "./data-provider"
import { Badge } from "@/components/ui/badge"

// Versión y fecha de la aplicación
const APP_VERSION = "1.0.0"
const LAST_UPDATE = "16 de abril de 2025"

// Stack tecnológico
const TECH_STACK = [
  { name: "React", description: "Biblioteca para interfaces de usuario" },
  { name: "Next.js", description: "Framework de React para aplicaciones web" },
  { name: "TypeScript", description: "JavaScript con tipado estático" },
  { name: "Tailwind CSS", description: "Framework CSS utilitario" },
  { name: "Shadcn UI", description: "Componentes de interfaz accesibles" },
  { name: "LocalStorage", description: "Almacenamiento local en el navegador" },
  { name: "PWA", description: "Aplicación web progresiva" },
  { name: "Service Workers", description: "Caché y funcionalidad offline" },
]

export function AcercaDePage() {
  const { resetearDatos } = useData()

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acerca de App Finanzas</CardTitle>
          <CardDescription>
            Versión {APP_VERSION} • Última actualización: {LAST_UPDATE}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            App Finanzas es una aplicación minimalista para el seguimiento de tus finanzas personales, desarrollada con
            un enfoque en la privacidad y la simplicidad.
          </p>

          <h3 className="text-lg font-medium">Desarrollado por</h3>
          <p>
            Esta aplicación fue creada por el equipo de desarrollo de{" "}
            <a
              href="https://calaverita.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center"
            >
              calaverita.dev <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </p>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://calaverita.dev" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Sitio web
              </a>
            </Button>
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-medium flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Stack Tecnológico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="flex items-start gap-2">
                <Badge variant="outline" className="px-2 py-1 font-medium">
                  {tech.name}
                </Badge>
                <span className="text-sm text-muted-foreground">{tech.description}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <h3 className="text-lg font-medium">Descargo de responsabilidad</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Almacenamiento local:</strong> Todos los datos de esta aplicación se almacenan exclusivamente en
              el localStorage de tu dispositivo. No se envía ninguna información a servidores externos.
            </p>
            <p>
              <strong>Pérdida de datos:</strong> Si desinstala la aplicación, borra los datos del navegador o elimina el
              localStorage, todos sus datos financieros se perderán permanentemente. Recomendamos utilizar la función de
              exportación para crear copias de seguridad periódicas.
            </p>
            <p>
              <strong>Privacidad:</strong> Sus datos financieros nunca salen de su dispositivo, lo que garantiza total
              privacidad, pero también significa que usted es el único responsable de mantener copias de seguridad.
            </p>
          </div>

          <Separator className="my-4" />

          <ExportarImportarDatos />

          <Separator className="my-4" />

          <h3 className="text-lg font-medium">Licencia</h3>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} calaverita.dev. Todos los derechos reservados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
