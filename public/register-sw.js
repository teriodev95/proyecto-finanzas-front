// Verificamos si el navegador soporta Service Workers
if ("serviceWorker" in navigator) {
  // Esperamos a que la página se cargue completamente
  window.addEventListener("load", () => {
    // Registramos el Service Worker desde la raíz del dominio
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
      })
      .catch((error) => {
        console.log("Error al registrar el Service Worker:", error)
      })
  })
}
