const CACHE_NAME = "finanzas-app-v1"

// Archivos a cachear inicialmente
const urlsToCache = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
]

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar solicitudes de red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si encontramos una coincidencia en la caché, la devolvemos
      if (response) {
        return response
      }

      // Si no está en caché, buscamos en la red
      return fetch(event.request)
    }),
  )
})
