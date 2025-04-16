"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Update UI to notify the user they can install the PWA
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler as any)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any)
    }
  }, [])

  const handleInstallClick = () => {
    // Hide the app provided install promotion
    setShowPrompt(false)
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      setDeferredPrompt(null)
    })
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 z-50 flex items-center justify-between">
      <div className="flex-1">
        <h3 className="font-medium">Instala esta aplicación</h3>
        <p className="text-sm text-muted-foreground">Accede rápidamente desde tu pantalla de inicio</p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => setShowPrompt(false)}>
          <X className="h-5 w-5" />
        </Button>
        <Button onClick={handleInstallClick}>
          <Download className="h-4 w-4 mr-2" />
          Instalar
        </Button>
      </div>
    </div>
  )
}
