"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, TrendingUp, PieChart, Shield, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api"

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("admin@demo.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Primero probar conectividad
      console.log('🔍 Probando conectividad...')
      const isConnected = await apiClient.testConnection()

      if (!isConnected) {
        throw new Error('No se puede conectar al servidor. Verifica tu conexión a internet.')
      }

      console.log('✅ Conectividad OK, intentando login...')
      await apiClient.login({ email, password })
      console.log('🎉 Login exitoso!')
      onLoginSuccess()
    } catch (err: any) {
      console.error('❌ Error en login:', err)
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setConnectionStatus("🔍 Probando...")
      const isConnected = await apiClient.testConnection()

      if (isConnected) {
        setConnectionStatus("✅ Conectado")
      } else {
        setConnectionStatus("❌ Sin conexión")
      }
    } catch (error) {
      setConnectionStatus("❌ Error de red")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Finanzas</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Controla tus finanzas de manera simple y efectiva
          </p>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Seguimiento de gastos e ingresos</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <PieChart className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Reportes visuales detallados</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Datos seguros en la nube</span>
          </div>
        </div>

        {/* Tarjeta de inicio de sesión */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu email y contraseña para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base"
                size="lg"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {/* Credenciales de demostración */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                Credenciales de demostración:
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Email: admin@demo.com<br />
                Contraseña: admin123
              </p>
            </div>

            {/* Información de depuración */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                Información de depuración:
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all">
                API: https://finanzas-personales-backend.clvrt.workers.dev
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Revisa la consola del navegador para más detalles
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Términos y privacidad */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  )
}