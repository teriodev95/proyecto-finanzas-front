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
          })
          .catch((error) => {
            console.log("Error al registrar el Service Worker:", error)
          })
      })
    }
  }, [])

  return null
}
