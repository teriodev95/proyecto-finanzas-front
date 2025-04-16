// Verificamos si el navegador soporta Service Workers
if ("serviceWorker" in navigator) {
  // Esperamos a que la página se cargue completamente
  window.addEventListener("load", () => {
    // Registramos el Service Worker desde la raíz del dominio
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
