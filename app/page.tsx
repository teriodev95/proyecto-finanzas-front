import { Navbar } from "@/components/navbar"
import { DataProvider } from "@/components/data-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

export default function Home() {
  return (
    <DataProvider>
      <main className="min-h-screen bg-background">
        <Navbar />
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
      </main>
    </DataProvider>
  )
}
