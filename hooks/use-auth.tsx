"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface UserProfile {
  profileId: string
  userId: number
  departmentId: number
  departmentName: string
  position: string
  isDefault: boolean
}

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
  position?: string
  profiles?: UserProfile[]
  activeProfile?: UserProfile
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
  userProfiles: UserProfile[]
  activeProfile: UserProfile | null
  setActiveProfile: (profile: UserProfile) => void
  loadUserProfiles: () => Promise<UserProfile[]>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null)
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

  // Load user profiles function - wrapped in useCallback to prevent recreation on each render
  const loadUserProfiles = useCallback(async (): Promise<UserProfile[]> => {
    // In a real implementation, this would make an API call to fetch profiles
    if (!user || !token) {
      return []
    }

    // Mock profiles for demonstration purposes
    const mockProfiles: UserProfile[] = [
      {
        profileId: "profile-1",
        userId: user.userId,
        departmentId: 1,
        departmentName: "Tecnología",
        position: "Analista de Sistemas",
        isDefault: true,
      },
      {
        profileId: "profile-2",
        userId: user.userId,
        departmentId: 2,
        departmentName: "Procesos",
        position: "Coordinador",
        isDefault: false,
      },
      {
        profileId: "profile-3",
        userId: user.userId,
        departmentId: 3,
        departmentName: "Recursos Humanos",
        position: "Supervisor",
        isDefault: false,
      },
    ]
    
    // Set profiles in state
    setUserProfiles(mockProfiles)
    
    // Set active profile if not already set
    if (!activeProfile) {
      const defaultProfile = mockProfiles.find(p => p.isDefault)
      if (defaultProfile) {
        setActiveProfile(defaultProfile)
      }
    }
    
    return mockProfiles
  }, [user, token, activeProfile]) // Include dependencies that are used inside
  
  // Handle profile change - wrapped in useCallback
  const handleSetActiveProfile = useCallback((profile: UserProfile) => {
    setActiveProfile(profile)
    
    // Update user with active profile information
    if (user) {
      setUser({
        ...user,
        activeProfile: profile,
        departmentId: profile.departmentId,
        departmentName: profile.departmentName,
        position: profile.position,
      })
    }
    
    // In a real implementation, you might want to save this preference
    try {
      localStorage.setItem("activeProfile", JSON.stringify(profile))
    } catch (error) {
      console.error("Error saving active profile:", error)
    }
  }, [user]) // Include dependencies that are used inside
  
  // Load user profiles on mount - with better dependency checking
  useEffect(() => {
    // Only load profiles when:
    // 1. We're mounted
    // 2. We have a user
    // 3. We have a token
    // 4. We DON'T already have profiles (to prevent infinite loop)
    if (mounted && user && token && userProfiles.length === 0) {
      loadUserProfiles()
    }
  }, [mounted, user, token, loadUserProfiles, userProfiles.length])
  
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    userProfiles,
    activeProfile,
    setActiveProfile: handleSetActiveProfile,
    loadUserProfiles,
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
