"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, X, User, Users, Building2, Send, UserCheck, Zap, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"

// Usuario logueado hardcoded (mantener como fallback)
const CURRENT_USER = {
  userId: "current-user",
  fullName: "GLOBALGAD GLOBALGAD",
  email: "administrador@municipiodemejia.gob.ec",
  departmentName: "Municipio de Mejía",
  position: "Administrador del Sistema",
}

interface ApiUser {
  userId: number
  username: string
  identification: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  departmentName: string
  departmentId: number
  position: string
  registrationDate: string
  lastAccess: string
  extendedDataId: number
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    data: ApiUser[]
    totalElements: number
    totalPages: number
    currentPage: number
    pageSize: number
    first: boolean
    last: boolean
    searchTerm: string
  }
  errorCode: string | null
}

interface RecipientSearchPanelProps {
  isOpen: boolean
  onClose: () => void
  onRecipientSelect: (recipient: any, type: "to" | "cc") => void
  onSenderSelect: (sender: any) => void
  existingRecipients: Array<{ id: string; name: string; email: string }>
  currentSender?: { id: string; name: string; email: string; institution?: string } | null
}

export default function RecipientSearchPanel({
  isOpen,
  onClose,
  onRecipientSelect,
  onSenderSelect,
  existingRecipients,
  currentSender,
}: RecipientSearchPanelProps) {
  const [activeTab, setActiveTab] = useState<"recipients" | "sender">("recipients")
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const PAGE_SIZE = 20

  // Función para buscar usuarios - CORREGIDA
  const searchUsers = useCallback(async (query: string, page = 0, reset = true) => {
    try {
      // Verificar que tenemos autenticación antes de hacer la request
      if (typeof window !== "undefined") {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}")
        console.log("🔐 Current auth state:", { hasToken: !!auth.token, tokenLength: auth.token?.length })

        if (!auth.token) {
          setError("No hay token de autenticación. Por favor, inicia sesión nuevamente.")
          return
        }
      }

      if (reset) {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      console.log("🔍 Making search request with GET method:", { query, page, reset })

      // Llamar directamente al método corregido
      const response = await apiClient.searchDocumentUsers(query, page, PAGE_SIZE)

      console.log("📋 Search response:", response)

      if (response.success) {
        const newUsers = response.data.data

        if (reset) {
          setUsers(newUsers)
        } else {
          setUsers((prev) => [...prev, ...newUsers])
        }

        setHasMore(!response.data.last)
        setCurrentPage(response.data.currentPage)
      } else {
        throw new Error(response.message || "Error al buscar usuarios")
      }
    } catch (err) {
      console.error("❌ Error searching users:", err)

      // Si es error 401, redirigir al login
      if (err instanceof Error && err.message.includes("401")) {
        setError("Sesión expirada. Redirigiendo al login...")
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        setError(err instanceof Error ? err.message : "Error al buscar usuarios")
      }

      if (reset) {
        setUsers([])
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0)
      searchUsers(searchTerm, 0, true)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, searchUsers])

  // Cargar más usuarios cuando cambia la pestaña
  useEffect(() => {
    setSearchTerm("")
    setCurrentPage(0)
    searchUsers("", 0, true)
  }, [activeTab, searchUsers])

  // Scroll infinito
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || isLoadingMore || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      searchUsers(searchTerm, currentPage + 1, false)
    }
  }, [searchTerm, currentPage, isLoadingMore, hasMore, searchUsers])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Convertir usuario de API a formato esperado
  const convertUser = (user: ApiUser) => ({
    id: user.userId.toString(),
    name: user.fullName,
    email: user.email,
    department: user.departmentName,
    position: user.position,
    institution: user.departmentName,
  })

  // Filtrar usuarios ya seleccionados para destinatarios
  const getFilteredUsers = () => {
    if (activeTab === "recipients") {
      const existingIds = existingRecipients.map((r) => r.id)
      return users.filter((user) => !existingIds.includes(user.userId.toString()))
    }
    return users
  }

  // Agrupar usuarios por departamento
  const groupedUsers = getFilteredUsers().reduce(
    (acc, user) => {
      const dept = user.departmentName || "Sin Departamento"
      if (!acc[dept]) {
        acc[dept] = []
      }
      acc[dept].push(user)
      return acc
    },
    {} as Record<string, ApiUser[]>,
  )

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Gestionar Remitente y Destinatarios</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("sender")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "sender"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center">
              <Send className="h-4 w-4 mr-2" />
              Remitente (De)
            </div>
          </button>
          <button
            onClick={() => setActiveTab("recipients")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "recipients"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Destinatarios
            </div>
          </button>
        </div>

        {/* Quick Select Current User (only in sender tab) */}
        {activeTab === "sender" && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Selección rápida</p>
                  <p className="text-sm text-blue-700">{CURRENT_USER.fullName}</p>
                  <p className="text-xs text-blue-600">{CURRENT_USER.email}</p>
                </div>
              </div>
              <button
                onClick={() => onSenderSelect(CURRENT_USER)}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={currentSender?.id === CURRENT_USER.userId}
              >
                {currentSender?.id === CURRENT_USER.userId ? "Seleccionado" : "De"}
              </button>
            </div>
          </div>
        )}

        {/* Current Sender Display (only in sender tab) */}
        {activeTab === "sender" && currentSender && currentSender.id !== CURRENT_USER.userId && (
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Remitente actual</p>
                  <p className="text-sm text-green-700">{currentSender.name}</p>
                  <p className="text-xs text-green-600">{currentSender.email}</p>
                </div>
              </div>
              <button
                onClick={() => onSenderSelect(null)}
                className="text-green-600 hover:text-green-800"
                title="Quitar remitente"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search Controls */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === "sender"
                  ? "Buscar remitente por nombre, email o cargo..."
                  : "Buscar destinatarios por nombre, email o cargo..."
              }
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="text-center py-8 text-red-500">
              <Users className="mx-auto h-12 w-12 text-red-400" />
              <p className="mt-2">Error al cargar usuarios</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => searchUsers(searchTerm, 0, true)}
                className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : Object.keys(groupedUsers).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No se encontraron usuarios</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <>
              {Object.entries(groupedUsers).map(([department, departmentUsers]) => (
                <div key={department} className="mb-6">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">{department}</h3>
                    <span className="ml-2 text-xs text-gray-500">({departmentUsers.length})</span>
                  </div>
                  <div className="space-y-2">
                    {departmentUsers.map((user) => (
                      <div key={user.userId} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">{user.position}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {activeTab === "sender" ? (
                              <button
                                onClick={() => onSenderSelect(convertUser(user))}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                disabled={currentSender?.id === user.userId.toString()}
                              >
                                {currentSender?.id === user.userId.toString() ? "Seleccionado" : "De"}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => onRecipientSelect(convertUser(user), "to")}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                  Para
                                </button>
                                <button
                                  onClick={() => onRecipientSelect(convertUser(user), "cc")}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                >
                                  CC
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Cargando más usuarios...</span>
                </div>
              )}

              {/* End of results indicator */}
              {!hasMore && users.length > 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No hay más usuarios para mostrar</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
