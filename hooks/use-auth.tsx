"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

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
  verifyToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth data on mount
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("auth")
      if (authData) {
        try {
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
        } catch (error) {
          console.error("❌ Error parsing auth data:", error)
          localStorage.removeItem("auth")
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = (authData: AuthData) => {
    console.log("✅ Login successful, storing auth data:", {
      username: authData.user.username,
      expiresAt: authData.expiresAt,
      token: authData.token.substring(0, 20) + "...",
    })

    setUser(authData.user)
    setToken(authData.token)

    if (typeof window !== "undefined") {
      localStorage.setItem("auth", JSON.stringify(authData))
    }

    router.push("/")
  }

  const logout = () => {
    console.log("🚪 Logging out user")
    setUser(null)
    setToken(null)

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth")
    }

    router.push("/login")
  }

  const verifyToken = async (): Promise<boolean> => {
    if (!token) return false
    return await apiClient.verifyToken()
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    verifyToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
