"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, FileText, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const [username, setUsername] = useState("globalgad")
  const [password, setPassword] = useState("ERPGADMCM2o2o")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { toast } = useToast()
  const { login } = useAuth()

  const testConnection = async () => {
    try {
      console.log("Testing connection to Next.js API proxy...")
      const response = await fetch("/api/auth/login", {
        method: "GET",
      })
      const data = await response.json()

      console.log("Connection test response:", data)
      setDebugInfo(data)

      if (data.backendReachable) {
        setConnectionStatus("✅ Backend conectado")
      } else {
        setConnectionStatus("❌ Backend no disponible")
      }
    } catch (error) {
      setConnectionStatus("❌ Error de conexión")
      console.error("Connection test failed:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu usuario y contraseña.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setConnectionStatus(null)

    try {
      console.log("=== FRONTEND LOGIN DEBUG ===")
      console.log("1. Sending login request to Next.js API proxy: /api/auth/login")
      console.log("2. Expected backend endpoint: http://127.0.0.1:8082/api/intdocs/auth/login")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      })

      console.log("3. Response status:", response.status)
      console.log("4. Response ok:", response.ok)

      const result = await response.json()
      console.log("5. Response data:", {
        success: result.success,
        hasToken: !!result.data?.token,
        error: result.error,
        details: result.details,
        endpoint: result.endpoint,
        backendUrl: result.backendUrl,
      })

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 503) {
          toast({
            title: "Servidor no disponible",
            description: "El servidor backend no está ejecutándose en el puerto 8082.",
            variant: "destructive",
          })
        } else if (response.status === 504) {
          toast({
            title: "Tiempo de espera agotado",
            description: "El servidor está tardando demasiado en responder.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error de conexión",
            description: result.details || result.error || "Error desconocido",
            variant: "destructive",
          })
        }
        return
      }

      if (result.success && result.data?.token) {
        const authData = {
          token: result.data.token,
          tokenType: result.data.tokenType,
          expiresAt: result.data.expiresAt,
          user: {
            userId: result.data.userId,
            username: result.data.username,
            fullName: result.data.fullName,
            email: result.data.email,
            roles: result.data.roles,
            permissions: result.data.permissions,
            organizationId: result.data.organizationId,
            organizationName: result.data.organizationName,
            departmentId: result.data.departmentId,
            departmentName: result.data.departmentName,
            userSource: result.data.userSource,
          },
        }

        login(authData)

        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${result.data.fullName}`,
          variant: "success",
        })
      } else {
        toast({
          title: "Error de autenticación",
          description: result.message || "Credenciales incorrectas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("=== FRONTEND ERROR ===", error)
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor. Verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Sistema de Gestión Documental</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Connection Status */}
          <div className="mb-4 flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={testConnection} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Probar Conexión
            </Button>
            {connectionStatus && <span className="text-xs font-medium">{connectionStatus}</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Debug Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span className="font-semibold">Información de Debug</span>
            </div>
            <p>• Frontend API: /api/auth/login</p>
            <p>• Backend URL: http://127.0.0.1:8082</p>
            <p>• Backend Endpoint: /api/intdocs/auth/login</p>
            <p>• Full URL: http://127.0.0.1:8082/api/intdocs/auth/login</p>
            <p>• Usuario: {username}</p>
            <p>• Contraseña: {"*".repeat(password.length)}</p>

            {debugInfo && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="font-semibold">Estado de Conexión:</p>
                <p>• Backend URL: {debugInfo.backendUrl}</p>
                <p>• Login Endpoint: {debugInfo.loginEndpoint}</p>
                <p>• Full Login URL: {debugInfo.fullLoginUrl}</p>
                <p>• Backend Reachable: {debugInfo.backendReachable ? "✅" : "❌"}</p>
              </div>
            )}

            <p className="mt-2 text-orange-600">
              ⚠️ Asegúrate de que el servidor backend esté ejecutándose en el puerto 8082
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
