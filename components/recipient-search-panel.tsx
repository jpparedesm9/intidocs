"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, User, Users, Building2, Send, UserCheck, Zap } from "lucide-react"

// Datos mock para instituciones y usuarios
const MOCK_INSTITUTIONS = [
  { id: "1", name: "Ministerio de Educación" },
  { id: "2", name: "Ministerio de Salud" },
  { id: "3", name: "Municipio de Quito" },
  { id: "4", name: "Municipio de Guayaquil" },
  { id: "5", name: "Universidad Central" },
  { id: "6", name: "Secretaría Nacional de Planificación" },
]

const MOCK_USERS = [
  {
    id: "101",
    name: "Carlos Jiménez",
    email: "cjimenez@educacion.gob.ec",
    institution: "Ministerio de Educación",
    institutionId: "1",
    position: "Director General",
  },
  {
    id: "102",
    name: "María López",
    email: "mlopez@educacion.gob.ec",
    institution: "Ministerio de Educación",
    institutionId: "1",
    position: "Coordinadora Académica",
  },
  {
    id: "103",
    name: "Juan Pérez",
    email: "jperez@salud.gob.ec",
    institution: "Ministerio de Salud",
    institutionId: "2",
    position: "Director de Hospitales",
  },
  {
    id: "104",
    name: "Ana Rodríguez",
    email: "arodriguez@salud.gob.ec",
    institution: "Ministerio de Salud",
    institutionId: "2",
    position: "Coordinadora de Programas",
  },
  {
    id: "105",
    name: "Luis Morales",
    email: "lmorales@quito.gob.ec",
    institution: "Municipio de Quito",
    institutionId: "3",
    position: "Director de Planificación",
  },
  {
    id: "106",
    name: "Patricia Andrade",
    email: "pandrade@guayaquil.gob.ec",
    institution: "Municipio de Guayaquil",
    institutionId: "4",
    position: "Directora de Proyectos",
  },
  {
    id: "107",
    name: "Roberto Sánchez",
    email: "rsanchez@uce.edu.ec",
    institution: "Universidad Central",
    institutionId: "5",
    position: "Decano",
  },
  {
    id: "108",
    name: "Carmen Vega",
    email: "cvega@planificacion.gob.ec",
    institution: "Secretaría Nacional de Planificación",
    institutionId: "6",
    position: "Directora de Seguimiento",
  },
]

// Usuario logueado hardcoded
const CURRENT_USER = {
  id: "current-user",
  name: "GLOBALGAD GLOBALGAD",
  email: "administrador@municipiodemejia.gob.ec",
  institution: "Municipio de Mejía",
  institutionId: "7",
  position: "Administrador del Sistema",
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
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [searchResults, setSearchResults] = useState<typeof MOCK_USERS>([])
  const [isSearching, setIsSearching] = useState(false)

  // Filtrar usuarios basado en término de búsqueda e institución seleccionada
  const filterUsers = useCallback(() => {
    setIsSearching(true)

    // Simular una búsqueda con delay para mostrar el estado de carga
    setTimeout(() => {
      let results = [...MOCK_USERS]

      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = results.filter(
          (user) =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.institution.toLowerCase().includes(term) ||
            user.position.toLowerCase().includes(term),
        )
      }

      // Filtrar por institución
      if (selectedInstitution) {
        results = results.filter((user) => user.institutionId === selectedInstitution)
      }

      // Para la pestaña de destinatarios, excluir destinatarios ya seleccionados
      if (activeTab === "recipients") {
        const existingIds = existingRecipients.map((r) => r.id)
        results = results.filter((user) => !existingIds.includes(user.id))
      }

      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }, [searchTerm, selectedInstitution, existingRecipients, activeTab])

  // Actualizar resultados cuando cambia el término de búsqueda, la institución o la pestaña activa
  useEffect(() => {
    filterUsers()
  }, [searchTerm, selectedInstitution, activeTab, filterUsers])

  // Limpiar búsqueda al cambiar de pestaña
  useEffect(() => {
    setSearchTerm("")
    setSelectedInstitution("")
  }, [activeTab])

  // Agrupar resultados por institución para mejor visualización
  const groupedResults = searchResults.reduce(
    (acc, user) => {
      if (!acc[user.institution]) {
        acc[user.institution] = []
      }
      acc[user.institution].push(user)
      return acc
    },
    {} as Record<string, typeof MOCK_USERS>,
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
                  <p className="text-sm text-blue-700">{CURRENT_USER.name}</p>
                  <p className="text-xs text-blue-600">{CURRENT_USER.email}</p>
                </div>
              </div>
              <button
                onClick={() => onSenderSelect(CURRENT_USER)}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={currentSender?.id === CURRENT_USER.id}
              >
                {currentSender?.id === CURRENT_USER.id ? "Seleccionado" : "De"}
              </button>
            </div>
          </div>
        )}

        {/* Current Sender Display (only in sender tab) */}
        {activeTab === "sender" && currentSender && currentSender.id !== CURRENT_USER.id && (
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
          <div className="relative mb-4">
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
          </div>

          {activeTab === "recipients" && (
            <div className="mb-2">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">
                Institución
              </label>
              <select
                id="institution"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
              >
                <option value="">Todas las instituciones</option>
                {MOCK_INSTITUTIONS.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Buscando...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">No se encontraron resultados</p>
              <p className="text-sm">Intenta con otros términos de búsqueda o filtros</p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([institution, users]) => (
              <div key={institution} className="mb-6">
                <div className="flex items-center mb-2">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">{institution}</h3>
                </div>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">{user.position}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {activeTab === "sender" ? (
                            <button
                              onClick={() => onSenderSelect(user)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              disabled={currentSender?.id === user.id}
                            >
                              {currentSender?.id === user.id ? "Seleccionado" : "De"}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => onRecipientSelect(user, "to")}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Para
                              </button>
                              <button
                                onClick={() => onRecipientSelect(user, "cc")}
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}
