"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, FileText, AlertCircle, RefreshCw, Copy } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const BACKEND_LOGIN_URL = "http://127.0.0.1:8082/api/intdocs/auth/login"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [lastError, setLastError] = useState<any>(null)
  const { toast } = useToast()
  const { login } = useAuth()

  const testConnection = async () => {
    try {
      console.log("Testing direct connection to backend:", BACKEND_LOGIN_URL)

      // Test with a simple GET request to see if the server is reachable
      const testUrl = "http://127.0.0.1:8082"
      const response = await fetch(testUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
      })

      const responseText = await response.text()
      console.log("Connection test response:", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText.substring(0, 200),
      })

      setDebugInfo({
        backendUrl: BACKEND_LOGIN_URL,
        testUrl: testUrl,
        backendReachable: response.ok,
        backendStatus: response.status,
        backendResponse: responseText.substring(0, 200),
      })

      if (response.ok) {
        setConnectionStatus("✅ Backend conectado")
      } else {
        setConnectionStatus("❌ Backend no disponible")
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("❌ Error de conexión")
      setDebugInfo({
        backendUrl: BACKEND_LOGIN_URL,
        backendReachable: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const copyErrorToClipboard = () => {
    if (lastError) {
      navigator.clipboard.writeText(JSON.stringify(lastError, null, 2))
      toast({
        title: "Error copiado",
        description: "Los detalles del error han sido copiados al portapapeles.",
        variant: "success",
      })
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
    setLastError(null)

    // No longer using mock login - all logins go through the real API

    try {
      console.log("=== DIRECT LOGIN DEBUG ===")
      console.log("1. Making direct call to backend:", BACKEND_LOGIN_URL)
      console.log("2. Request body:", { username: username.trim(), password: "***" })

      const requestBody = {
        username: username.trim(),
        password: password.trim(),
      }

      const response = await fetch(BACKEND_LOGIN_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("3. Response status:", response.status)
      console.log("4. Response ok:", response.ok)
      console.log("5. Response headers:", Object.fromEntries(response.headers.entries()))

      // Get the response text first to handle non-JSON responses
      const responseText = await response.text()
      console.log("6. Raw response text:", responseText.substring(0, 500))

      if (!response.ok) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          url: BACKEND_LOGIN_URL,
          responseText: responseText,
          headers: Object.fromEntries(response.headers.entries()),
        }

        setLastError(errorDetails)

        // Handle specific HTTP status codes
        if (response.status === 401) {
          toast({
            title: "Credenciales incorrectas",
            description: "El usuario o la contraseña son incorrectos. Por favor, intente nuevamente.",
            variant: "destructive",
          })
        } else if (response.status === 404) {
          toast({
            title: "Endpoint no encontrado",
            description: "El endpoint de login no existe en el servidor backend.",
            variant: "destructive",
          })
        } else if (response.status === 405) {
          toast({
            title: "Método no permitido",
            description: "El servidor no acepta requests POST en este endpoint.",
            variant: "destructive",
          })
        } else if (response.status === 500) {
          toast({
            title: "Error interno del servidor",
            description: "El servidor backend tiene un error interno.",
            variant: "destructive",
          })
        } else if (response.status === 403) {
          toast({
            title: "Acceso denegado",
            description: "No tiene permiso para acceder al sistema. Contacte al administrador.",
            variant: "destructive",
          })
        } else if (response.status === 429) {
          toast({
            title: "Demasiados intentos",
            description: "Ha realizado demasiados intentos de inicio de sesión. Por favor, intente más tarde.",
            variant: "destructive",
          })
        } else {
          toast({
            title: `Error ${response.status}`,
            description: responseText || response.statusText,
            variant: "destructive",
          })
        }
        return
      }

      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
        console.log("7. Successfully parsed JSON response:", {
          success: result.success,
          hasToken: !!result.data?.token,
          message: result.message,
        })
      } catch (jsonError) {
        console.error("8. Failed to parse JSON response:", jsonError)
        console.error("9. Response was:", responseText)

        setLastError({
          error: "Invalid JSON response",
          responseText: responseText,
          jsonError: jsonError instanceof Error ? jsonError.message : String(jsonError),
        })

        toast({
          title: "Respuesta inválida del servidor",
          description: "El servidor devolvió una respuesta que no es JSON válido.",
          variant: "destructive",
        })
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

        console.log("10. Login successful, storing auth data")
        login(authData)

        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${result.data.fullName}`,
          variant: "success",
        })
      } else {
        console.log("11. Login failed:", result)
        setLastError(result)
        toast({
          title: "Error de autenticación",
          description: result.message || "Credenciales incorrectas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("=== DIRECT LOGIN ERROR ===", error)

      const errorDetails = {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: BACKEND_LOGIN_URL,
      }

      setLastError(errorDetails)

      // Handle specific error types
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar al servidor. Verifique su conexión a internet o contacte al administrador del sistema.",
          variant: "destructive",
        })
      } else if (error instanceof Error && error.message.includes("CORS")) {
        toast({
          title: "Error de configuración",
          description: "Error de configuración del servidor. Por favor contacte al administrador del sistema.",
          variant: "destructive",
        })
      } else if (error instanceof Error && error.message.includes("NetworkError")) {
        toast({
          title: "Error de red",
          description: "Existe un problema con la conexión a internet. Por favor verifique su conexión y vuelva a intentarlo.",
          variant: "destructive",
        })
      } else if (error instanceof Error && error.message.includes("timeout")) {
        toast({
          title: "Tiempo de espera agotado",
          description: "El servidor está tardando demasiado en responder. Intente nuevamente más tarde.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error de autenticación",
          description: "Ocurrió un error durante el inicio de sesión. Por favor intente nuevamente.",
          variant: "destructive",
        })
      }
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

          {/* Error Details */}
          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-red-800">Detalles del Error</span>
                <Button type="button" variant="ghost" size="sm" onClick={copyErrorToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-red-700 max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(lastError, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Connection Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span className="font-semibold">Información de Conexión</span>
            </div>
            <p>• Conexión: DIRECTA al backend</p>
            <p>• Backend URL: {BACKEND_LOGIN_URL}</p>
              
            {debugInfo && (
              <div className="mt-2 p-2 bg-white rounded border">
                <p className="font-semibold">Estado de Conexión:</p>
                <p>• Backend Reachable: {debugInfo.backendReachable ? "✅" : "❌"}</p>
                <p>• Backend Status: {debugInfo.backendStatus}</p>
                {debugInfo.error && <p>• Error: {debugInfo.error}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
