// Versión de la caché - cambiar este valor cuando se despliegue una nueva versión
const CACHE_VERSION = "v1.1.1"
const CACHE_NAME = `finanzas-app-${CACHE_VERSION}`

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
  console.log(`[Service Worker] Instalando nueva versión ${CACHE_VERSION}`)

  // Forzar al nuevo service worker a activarse inmediatamente
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Cacheando archivos")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Activando nueva versión ${CACHE_VERSION}`)

  // Tomar el control de todas las pestañas abiertas sin recargar
  self.clients.claim()

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguas que no coincidan con la versión actual
          if (cacheName.startsWith("finanzas-app-") && cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Eliminando caché antigua:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  // Notificar a los clientes que hay una nueva versión
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "UPDATE_AVAILABLE",
        version: CACHE_VERSION,
      })
    })
  })
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
        .then((response) => {
          // No cachear si la respuesta no es válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clonar la respuesta porque se consume al leerla
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("[Service Worker] Error al recuperar recurso:", error)
          // Aquí podrías devolver una página de fallback para cuando no hay conexión
        })
    }),
  )
})

// Escuchar mensajes de la aplicación
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
