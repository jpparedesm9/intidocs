"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing auth data on mount
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
          } else {
            // Token expired, clear storage
            localStorage.removeItem("auth")
          }
        }
      } catch (error) {
        console.error("Error parsing auth data:", error)
        localStorage.removeItem("auth")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (authData: AuthData) => {
    setUser(authData.user)
    setToken(authData.token)
    localStorage.setItem("auth", JSON.stringify(authData))
    router.push("/")
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth")
    router.push("/login")
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
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
