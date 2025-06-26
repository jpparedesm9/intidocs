"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { 
  Search, X, User, Users, Building2, Send, Loader2, 
  UserCheck, UserPlus, Clock, ChevronDown, UserCog, PenTool
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import SimpleModal from "./simple-modal"

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

interface SendingList {
  id: string
  name: string
  description?: string
  members: number
}

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onRecipientSelect: (recipient: any, type: "to" | "cc") => void
  onSenderSelect: (sender: any) => void
  existingRecipients: Array<{ id: string; name: string; email: string }>
  currentSender?: { id: string; name: string; email: string; institution?: string } | null
}

export default function UserSearchModal({
  isOpen,
  onClose,
  onRecipientSelect,
  onSenderSelect,
  existingRecipients,
  currentSender,
}: UserSearchModalProps) {
  // El SimpleModal maneja internamente el caso cuando isOpen es falso
  
  // Estado para los campos de búsqueda
  const [userType, setUserType] = useState("servidor_publico")
  const [searchTerm, setSearchTerm] = useState("")
  const [institution, setInstitution] = useState("todas")
  const [listName, setListName] = useState("")
  const [selectedLists, setSelectedLists] = useState<SendingList[]>([])
  
  // Estado para resultados de búsqueda
  const [searchResults, setSearchResults] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  console.log("Renderizando UserSearchModal. isOpen:", isOpen, "searchResults:", searchResults)
  
  // Estado para datos seleccionados
  const [sender, setSender] = useState<ApiUser | null>(null)
  const [toRecipients, setToRecipients] = useState<ApiUser[]>([])
  const [ccRecipients, setCcRecipients] = useState<ApiUser[]>([])
  
  // Opciones para los selects
  const userTypeOptions = [
    { value: "servidor_publico", label: "Servidor Público" },
    { value: "ciudadano", label: "Ciudadano" },
    { value: "todos", label: "Todos los Usuarios" }
  ]
  
  const institutionOptions = [
    { value: "todas", label: "Todas las Instituciones" },
    { value: "ministerio_educacion", label: "Ministerio de Educación" },
    { value: "ministerio_salud", label: "Ministerio de Salud" },
    { value: "ministerio_finanzas", label: "Ministerio de Finanzas" },
    { value: "senescyt", label: "SENESCYT" },
    { value: "municipio_quito", label: "Municipio de Quito" }
  ]
  
  const listOptions = [
    { value: "lista_directores", label: "Lista de Directores", description: "Directores de todas las áreas", members: 15 },
    { value: "lista_gerentes", label: "Lista de Gerentes", description: "Gerentes departamentales", members: 8 },
    { value: "lista_administradores", label: "Administradores de Sistema", description: "Administradores de la plataforma", members: 3 }
  ]
  
  // Mock de listas de envío
  const sendingLists: SendingList[] = [
    { id: "lista_directores", name: "Lista de Directores", description: "Directores de todas las áreas", members: 15 },
    { id: "lista_gerentes", name: "Lista de Gerentes", description: "Gerentes departamentales", members: 8 },
    { id: "lista_administradores", name: "Administradores de Sistema", description: "Administradores de la plataforma", members: 3 }
  ]
  
  // Tiempo desde último acceso (para el ícono de semáforo)
  const getLastAccessStatus = (lastAccess: string): "green" | "yellow" | "red" => {
    const lastAccessDate = new Date(lastAccess);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - lastAccessDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return "green";
    } else if (diffDays <= 30) {
      return "yellow";
    } else {
      return "red";
    }
  }
  
  // Función para buscar usuarios
  const searchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Buscando usuarios con término:", searchTerm)
      
      // Llamar a la API de búsqueda de usuarios
      const response = await apiClient.searchDocumentUsers(searchTerm)
      
      console.log("Respuesta del servicio:", response)
      
      if (response.success) {
        console.log("Resultados encontrados:", response.data.data)
        
        if (!response.data.data) {
          console.warn("🔴 API devolvió éxito pero sin datos.data")
          setSearchResults([])
        } else if (!Array.isArray(response.data.data)) {
          console.warn("🔴 API devolvió éxito pero data.data no es un array:", typeof response.data.data)
          // Intentar convertir a array si es posible
          const resultsArray = Array.isArray(response.data.data) ? response.data.data : 
                             Object.values(response.data.data).filter(item => typeof item === 'object')
          console.log("Convertido a array:", resultsArray)
          setSearchResults(resultsArray)
        } else {
          console.log("✅ Actualizando searchResults con", response.data.data.length, "elementos")
          setSearchResults(response.data.data)
        }
      } else {
        throw new Error(response.message || "Error al buscar usuarios")
      }
    } catch (err) {
      console.error("Error searching users:", err)
      setError(err instanceof Error ? err.message : "Error al buscar usuarios")
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm])
  
  // Manejar acción de buscar
  const handleSearch = () => {
    searchUsers()
  }
  
  // Manejar selección de remitente
  const handleSelectSender = (user: ApiUser) => {
    setSender(user)
  }
  
  // Manejar selección de destinatario principal
  const handleSelectTo = (user: ApiUser) => {
    if (!toRecipients.some(r => r.userId === user.userId)) {
      setToRecipients([...toRecipients, user])
    }
  }
  
  // Manejar selección de destinatario en copia
  const handleSelectCc = (user: ApiUser) => {
    if (!ccRecipients.some(r => r.userId === user.userId)) {
      setCcRecipients([...ccRecipients, user])
    }
  }
  
  // Manejar eliminación de remitente
  const handleRemoveSender = () => {
    setSender(null)
  }
  
  // Manejar eliminación de destinatario principal
  const handleRemoveTo = (userId: number) => {
    setToRecipients(toRecipients.filter(r => r.userId !== userId))
  }
  
  // Manejar eliminación de destinatario en copia
  const handleRemoveCc = (userId: number) => {
    setCcRecipients(ccRecipients.filter(r => r.userId !== userId))
  }
  
  // Manejar borrar nombre de lista
  const handleClearListName = () => {
    setListName("")
    setSelectedLists([])
  }
  
  // Manejar editar lista
  const handleEditList = () => {
    alert("Funcionalidad de editar lista aún no implementada")
  }
  
  // Manejar añadir lista a destinatarios
  const handleAddListTo = (list: SendingList) => {
    alert(`Añadir lista ${list.name} como destinatario principal`)
  }
  
  // Manejar añadir lista a destinatarios en copia
  const handleAddListCc = (list: SendingList) => {
    alert(`Añadir lista ${list.name} como destinatario en copia`)
  }
  
  // Manejar aceptar selección
  const handleAccept = () => {
    // Enviar remitente seleccionado
    if (sender) {
      onSenderSelect({
        id: sender.userId.toString(),
        name: sender.fullName,
        email: sender.email,
        institution: sender.departmentName
      })
    }
    
    // Enviar destinatarios principales
    toRecipients.forEach(recipient => {
      onRecipientSelect({
        id: recipient.userId.toString(),
        name: recipient.fullName,
        email: recipient.email,
        institution: recipient.departmentName
      }, "to")
    })
    
    // Enviar destinatarios en copia
    ccRecipients.forEach(recipient => {
      onRecipientSelect({
        id: recipient.userId.toString(),
        name: recipient.fullName,
        email: recipient.email,
        institution: recipient.departmentName
      }, "cc")
    })
    
    onClose()
  }
  
  // Manejar crear ciudadano
  const handleCreateCitizen = () => {
    alert("Funcionalidad de crear ciudadano aún no implementada")
  }
  
  // Renderizar ícono de último acceso
  const renderLastAccessIcon = (lastAccess: string) => {
    const status = getLastAccessStatus(lastAccess)
    
    if (status === "green") {
      return <Clock className="h-4 w-4 text-green-500" title="Último acceso: dentro de los últimos 7 días" />
    } else if (status === "yellow") {
      return <Clock className="h-4 w-4 text-yellow-500" title="Último acceso: entre 8 y 30 días atrás" />
    } else {
      return <Clock className="h-4 w-4 text-red-500" title="Último acceso: hace más de 30 días" />
    }
  }
  
  // Registrar cambios en searchResults
  useEffect(() => {
    console.log("🔄 Estado de searchResults actualizado:", {
      resultCount: searchResults.length,
      isEmpty: searchResults.length === 0,
      isArray: Array.isArray(searchResults)
    })
  }, [searchResults])
  
  // Registrar cambios en isLoading
  useEffect(() => {
    console.log("🔄 Estado de isLoading actualizado:", isLoading)
  }, [isLoading])
  
  // Registrar cambios en error
  useEffect(() => {
    if (error) {
      console.log("🔄 Estado de error actualizado:", error)
    }
  }, [error])
  
  // Buscar usuarios al cambiar término de búsqueda o institución
  useEffect(() => {
    // Realizamos una búsqueda inicial al abrir el modal
    if (isOpen) {
      console.log("🔍 Modal abierto, iniciando búsqueda inicial")
      searchUsers()
    }
  }, [isOpen, searchUsers])
  
  // Buscar cuando se cambia el término de búsqueda
  useEffect(() => {
    // Solo buscar si hay un término de al menos 2 caracteres
    if (searchTerm && searchTerm.length >= 2) {
      console.log("🔍 Término de búsqueda cambiado:", searchTerm)
      // Agregar un pequeño retraso para no hacer demasiadas peticiones mientras el usuario escribe
      const timeoutId = setTimeout(() => {
        searchUsers()
      }, 300)
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, searchUsers])

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Búsqueda de Remitentes y Destinatarios"
      width="max-w-6xl"
      height="h-[90vh]"
    >
        {/* Usamos una clase específica para controlar el layout */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sección Superior - Formulario de búsqueda (reducida en altura) */}
          <div className="bg-gray-50 p-3 rounded-md border flex-shrink-0">
            <h3 className="font-semibold mb-1 text-gray-700 text-sm">Sección (1): Criterios de Búsqueda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tipo de usuario */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tipo de usuario:</label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar tipo de usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Datos usuario */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Datos usuario:</label>
                <div className="relative">
                  <Input
                    placeholder="Buscar por cédula, nombre, cargo, correo, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-9"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              {/* Institución */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Institución:</label>
                <Select value={institution} onValueChange={setInstitution}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botón Buscar */}
              <div className="flex items-end space-x-2">
                <Button 
                  onClick={() => {
                    console.log("Botón de búsqueda presionado")
                    handleSearch()
                  }} 
                  disabled={isLoading} 
                  className="h-9"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
                
                {/* Botón para forzar búsqueda con datos de prueba - solo visible en desarrollo */}
                <Button 
                  onClick={() => {
                    console.log("Forzando búsqueda con datos de prueba")
                    // Establecer searchTerm a "aa" que devuelve datos ficticios en el API
                    setSearchTerm("aa")
                    setTimeout(() => {
                      searchUsers()
                    }, 100)
                  }} 
                  variant="outline"
                  className="h-9 bg-yellow-50 border-yellow-200 text-yellow-700 text-xs"
                  title="Usar datos de prueba"
                >
                  <span className="mr-1">🧪</span> Datos Prueba
                </Button>
              </div>
              
              {/* Nombre de Lista */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Nombre de Lista:</label>
                <Select value={listName} onValueChange={setListName}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar lista de envío" />
                  </SelectTrigger>
                  <SelectContent>
                    {listOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} ({option.members} miembros)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Listas Seleccionadas */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Listas Seleccionadas:</label>
                <div className="flex items-center">
                  <Input 
                    value={listName ? listOptions.find(l => l.value === listName)?.label || "" : ""} 
                    readOnly 
                    className="h-9 bg-gray-50"
                  />
                  
                  <div className="flex ml-2 space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!listName} 
                      onClick={() => {
                        const selectedList = sendingLists.find(l => l.id === listName);
                        if (selectedList) handleAddListTo(selectedList);
                      }}
                      className="h-9 px-2"
                    >
                      Para
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={!listName}
                      onClick={() => {
                        const selectedList = sendingLists.find(l => l.id === listName);
                        if (selectedList) handleAddListCc(selectedList);
                      }}
                      className="h-9 px-2"
                    >
                      Copia
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleClearListName}
                    disabled={!listName}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Borrar nombre de lista
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleEditList}
                    disabled={!listName}
                    className="h-7 text-xs"
                  >
                    <PenTool className="h-3 w-3 mr-1" />
                    Editar lista
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección Central - Resultados de búsqueda */}
          <div className="border rounded-md flex-1 min-h-[250px] overflow-hidden flex flex-col my-2">
            <div className="bg-gray-50 p-2 border-b sticky top-0 z-10 flex-shrink-0">
              <h3 className="font-semibold text-gray-700 text-sm">Sección (2): Personas en la lista</h3>
            </div>
            
            {/* Añadimos div de depuración visible para desarrollo */}
            <div className="bg-yellow-50 p-1 text-xs border-b flex-shrink-0">
              <strong>Debug:</strong> Hay {searchResults.length} resultados disponibles para mostrar
            </div>
            
            {(() => {
              // Usamos una función auto-ejecutable para tener mejor control sobre el renderizado
              
              // Caso 1: Hay un error
              if (error) {
                return (
                  <div className="p-8 text-center">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={searchUsers} className="mt-2">Reintentar</Button>
                  </div>
                );
              }
              
              // Caso 2: Está cargando
              if (isLoading) {
                return (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                );
              }
              
              // Caso 3: No hay resultados
              if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) {
                console.log("⚠️ No hay resultados para mostrar", {
                  searchResults,
                  isArray: Array.isArray(searchResults),
                  length: searchResults ? searchResults.length : 0
                });
                
                return (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2">No se encontraron resultados</p>
                    <p className="text-sm">Intente con otros criterios de búsqueda</p>
                    {searchTerm && <Button onClick={searchUsers} className="mt-2">Buscar "{searchTerm}"</Button>}
                  </div>
                );
              }
              
              // Caso 4: Hay resultados para mostrar
              // Agregamos un log para ver los resultados
              console.log("✅ Renderizando tabla con resultados:", {
                count: searchResults.length, 
                firstResult: searchResults[0],
                allResults: searchResults
              });
              
              // Garantizamos que resultsToShow sea un array válido con los datos necesarios
              const resultsToShow = searchResults.map(user => ({
                userId: user.userId || Math.random(),
                username: user.username || 'usuario',
                fullName: user.fullName || 'Usuario Sin Nombre',
                departmentName: user.departmentName || 'Departamento Sin Asignar',
                position: user.position || 'Posición Sin Asignar',
                email: user.email || 'email@example.com',
                lastAccess: user.lastAccess || new Date().toISOString()
              }));
              
              // Renderizamos la tabla de resultados con una estructura simplificada
              // Tenemos que asegurarnos de que ocupe espacio visible
              return (
                <div className="flex-1 overflow-y-auto h-0 min-h-0">
                  {/* Tabla con resultados - overflow habilitado para permitir scroll */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="w-[8%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Tipo
                          </th>
                          <th className="w-[15%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Nombres
                          </th>
                          <th className="w-[15%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Institución
                          </th>
                          <th className="w-[12%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Puesto
                          </th>
                          <th className="w-[15%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            E-mail
                          </th>
                          <th className="w-[10%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Uso
                          </th>
                          <th className="w-[25%] px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase border-b">
                            Colocar como
                          </th>
                        </tr>
                      </thead>
                      
                      <tbody className="bg-white">
                        {resultsToShow.map((user, index) => (
                          <tr key={user.userId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-2 py-2 text-xs border-b">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {user.username?.includes("admin") ? "(Serv.)" : "(Ciu.)"}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-xs font-medium border-b truncate">
                              {user.fullName}
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-600 border-b truncate">
                              {user.departmentName}
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-600 border-b truncate">
                              {user.position}
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-600 border-b truncate">
                              {user.email}
                            </td>
                            <td className="px-2 py-2 text-xs border-b">
                              <div className="flex gap-1">
                                {renderLastAccessIcon(user.lastAccess)}
                                <UserCheck className="h-3 w-3 text-blue-500" title="Puede enviar y recibir documentos electrónicamente" />
                              </div>
                            </td>
                            <td className="px-2 py-2 border-b">
                              <div className="flex flex-wrap gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectSender(user)}
                                  className="h-6 px-2 text-xs bg-white"
                                  disabled={sender?.userId === user.userId}
                                >
                                  De
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectTo(user)}
                                  className="h-6 px-2 text-xs bg-white"
                                  disabled={toRecipients.some(r => r.userId === user.userId)}
                                >
                                  Para
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectCc(user)}
                                  className="h-6 px-2 text-xs bg-white"
                                  disabled={ccRecipients.some(r => r.userId === user.userId)}
                                >
                                  Copia
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Sección Inferior - Datos a colocar en el documento (más compacta) */}
          <div className="bg-gray-50 p-3 rounded-md border flex-shrink-0">
            <h3 className="font-semibold mb-1 text-gray-700 text-sm">Sección (3): Datos a colocar en el documento</h3>
            
            <div className="space-y-2">
              {/* Remitente */}
              <div className="flex items-center">
                <span className="w-16 font-medium text-gray-700 text-sm">De:</span>
                {sender ? (
                  <div className="flex flex-1 items-center bg-green-50 border border-green-200 rounded-md px-2 py-1">
                    <div>
                      <p className="font-medium text-green-800 text-sm">{sender.fullName}</p>
                      <p className="text-xs text-green-700">{sender.position} - {sender.departmentName}</p>
                    </div>
                    <button
                      onClick={handleRemoveSender}
                      className="ml-auto text-green-500 hover:text-green-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-xs">Ningún remitente seleccionado</span>
                )}
              </div>
              
              {/* Destinatarios Para */}
              <div className="flex items-start">
                <span className="w-16 font-medium text-gray-700 pt-1 text-sm">Para:</span>
                {toRecipients.length > 0 ? (
                  <div className="flex-1 flex flex-wrap gap-1">
                    {toRecipients.map(recipient => (
                      <div 
                        key={recipient.userId}
                        className="flex items-center bg-blue-50 border border-blue-200 rounded-md px-2 py-1"
                      >
                        <div>
                          <p className="font-medium text-blue-800 text-sm">{recipient.fullName}</p>
                          <p className="text-xs text-blue-700">{recipient.position} - {recipient.departmentName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTo(recipient.userId)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-xs">Ningún destinatario principal seleccionado</span>
                )}
              </div>
              
              {/* Destinatarios CC */}
              <div className="flex items-start">
                <span className="w-16 font-medium text-gray-700 pt-1 text-sm">Copia:</span>
                {ccRecipients.length > 0 ? (
                  <div className="flex-1 flex flex-wrap gap-1">
                    {ccRecipients.map(recipient => (
                      <div 
                        key={recipient.userId}
                        className="flex items-center bg-yellow-50 border border-yellow-200 rounded-md px-2 py-1"
                      >
                        <div>
                          <p className="font-medium text-yellow-800 text-sm">{recipient.fullName}</p>
                          <p className="text-xs text-yellow-700">{recipient.position} - {recipient.departmentName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveCc(recipient.userId)}
                          className="ml-1 text-yellow-500 hover:text-yellow-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-xs">Ningún destinatario en copia seleccionado</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-3">
              {/* Botón Crear Ciudadano - solo visible si tipo de usuario es Ciudadano */}
              {userType === "ciudadano" && (
                <Button onClick={handleCreateCitizen} variant="outline" size="sm" className="text-xs h-8">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Crear Ciudadano
                </Button>
              )}
              
              <div className="flex space-x-2 ml-auto">
                <Button variant="outline" onClick={onClose} size="sm" className="text-xs h-8">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAccept} 
                  disabled={!sender && toRecipients.length === 0 && ccRecipients.length === 0}
                  size="sm"
                  className="text-xs h-8"
                >
                  Aceptar
                </Button>
              </div>
            </div>
          </div>
        </div>
    </SimpleModal>
  )
}