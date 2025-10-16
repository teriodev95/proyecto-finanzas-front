"use client"

import { Navbar } from "@/components/navbar"
import { DataProvider } from "@/components/api-data-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { UpdateNotification } from "@/components/update-notification"
import { LoginScreen } from "@/components/login-screen"
import { useAuth } from "@/contexts/api-auth-context"
import { useState } from "react"

export default function Home() {
  const { user, loading } = useAuth()
  const [forceReload, setForceReload] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={() => setForceReload(prev => prev + 1)} />
  }

  return (
    <DataProvider>
      <main className="min-h-screen bg-background">
        <Navbar />
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
        <UpdateNotification />
      </main>
    </DataProvider>
  )
}
