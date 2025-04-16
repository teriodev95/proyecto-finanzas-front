"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null)
  const [newVersion, setNewVersion] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay una versión guardada en localStorage que el usuario haya descartado
    const savedDismissedVersion = localStorage.getItem("dismissedUpdateVersion")
    if (savedDismissedVersion) {
      setDismissedVersion(savedDismissedVersion)
    }

    // Función para manejar mensajes del Service Worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_AVAILABLE") {
        const version = event.data.version
        setNewVersion(version)

        // Solo mostrar la notificación si es una versión diferente a la que el usuario descartó
        if (version !== savedDismissedVersion) {
          setUpdateAvailable(true)
        }
      }
    }

    // Registrar el listener para mensajes del Service Worker
    navigator.serviceWorker.addEventListener("message", handleMessage)

    // Verificar si hay una actualización disponible al cargar la página
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
      })
    }

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage)
    }
  }, [])

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Enviar mensaje al Service Worker para que se active inmediatamente
        registration.waiting?.postMessage({ type: "SKIP_WAITING" })

        // Recargar la página para obtener la nueva versión
        window.location.reload()
      })
    }
  }

  const dismissUpdate = () => {
    if (newVersion) {
      // Guardar la versión descartada en localStorage
      localStorage.setItem("dismissedUpdateVersion", newVersion)
      setDismissedVersion(newVersion)
    }
    setUpdateAvailable(false)
  }

  if (!updateAvailable) return null

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4",
        "animate-in slide-in-from-bottom duration-300 ease-in-out",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary animate-spin-slow" />
          <div>
            <h3 className="font-medium">Nueva versión disponible</h3>
            <p className="text-sm text-muted-foreground">Actualiza para obtener las últimas mejoras</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={dismissUpdate} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={updateApp} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar aplicación
          </Button>
        </div>
      </div>
    </div>
  )
}
