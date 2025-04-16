import { Navbar } from "@/components/navbar"
import { DataProvider } from "@/components/data-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { UpdateNotification } from "@/components/update-notification"

export default function Home() {
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
