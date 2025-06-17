"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  userId: number
  username: string
  fullName: string
  email: string
  roles: string[]
  permissions: any[]
  organizationId: number | null
  organizationName: string | null
  departmentId: number | null
  departmentName: string | null
  userSource: string
}

interface AuthData {
  token: string
  tokenType: string
  expiresAt: string
  user: User
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (authData: AuthData) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check for existing auth data on mount
    try {
      const authData = localStorage.getItem("auth")
      if (authData) {
        const parsed = JSON.parse(authData)
        if (parsed.token && parsed.user) {
          // Check if token is expired
          const expiresAt = new Date(parsed.expiresAt)
          if (expiresAt > new Date()) {
            setUser(parsed.user)
            setToken(parsed.token)
            console.log("🔐 Auth restored from localStorage:", {
              username: parsed.user.username,
              expiresAt: parsed.expiresAt,
              token: parsed.token.substring(0, 20) + "...",
            })
          } else {
            // Token expired, clear storage
            console.log("⏰ Token expired, clearing auth data")
            localStorage.removeItem("auth")
          }
        }
      }
    } catch (error) {
      console.error("❌ Error parsing auth data:", error)
      localStorage.removeItem("auth")
    }

    setIsLoading(false)
  }, [mounted])

  const login = (authData: AuthData) => {
    console.log("✅ Login successful, storing auth data:", {
      username: authData.user.username,
      expiresAt: authData.expiresAt,
      token: authData.token.substring(0, 20) + "...",
    })

    setUser(authData.user)
    setToken(authData.token)

    if (mounted) {
      localStorage.setItem("auth", JSON.stringify(authData))
    }

    router.push("/")
  }

  const logout = () => {
    console.log("🚪 Logging out user")
    setUser(null)
    setToken(null)

    if (mounted) {
      localStorage.removeItem("auth")
    }

    router.push("/login")
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  }

  // Don't render children until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
