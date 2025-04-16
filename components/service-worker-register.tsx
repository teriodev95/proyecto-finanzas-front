"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registrado correctamente:", registration.scope)

            // Verificar si hay actualizaciones cada hora
            setInterval(
              () => {
                registration.update()
                console.log("Verificando actualizaciones del Service Worker...")
              },
              60 * 60 * 1000,
            ) // 1 hora

            // Verificar actualizaciones al inicio
            registration.update()
          })
          .catch((error) => {
            console.log("Error al registrar el Service Worker:", error)
          })
      })

      // Escuchar eventos de actualización del Service Worker
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed - page will reload")
        // La página se recargará automáticamente cuando el nuevo Service Worker tome el control
      })
    }
  }, [])

  return null
}
