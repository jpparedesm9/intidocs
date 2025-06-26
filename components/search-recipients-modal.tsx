"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { 
  Search, X, User, Users, Building2, Send, Loader2, 
  UserCheck, UserPlus, Clock, ChevronDown, UserCog, PenTool,
  List, Check, Key, Circle, AlertCircle, Plus
} from "lucide-react"
import { apiClient, SendingList } from "@/lib/api"
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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"

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

interface SearchRecipientsModalProps {
  isOpen: boolean
  onClose: () => void
  onRecipientSelect: (
    recipient: any | null, // null para eliminar
    type: "to" | "cc",
    recipientId?: string // Si recipient es null, se debe proporcionar recipientId para saber cuál eliminar
  ) => void
  onSenderSelect: (sender: any | null) => void // null para eliminar
  existingRecipients: Array<{ 
    id: string; 
    name: string; 
    email: string; 
    institution?: string;
    position?: string;
    type?: "to" | "cc"; // Tipo de destinatario (para diferenciar to y cc)
  }>
  currentSender?: { 
    id: string; 
    name: string; 
    email: string; 
    institution?: string;
    position?: string;
  } | null
}

export default function SearchRecipientsModal({
  isOpen,
  onClose,
  onRecipientSelect,
  onSenderSelect,
  existingRecipients,
  currentSender,
}: SearchRecipientsModalProps) {
  // Toast notifications
  const { toast } = useToast()
  
  // Estados
  const [activeTab, setActiveTab] = useState<'search' | 'list'>('search')
  const [userType, setUserType] = useState("servidor_publico")
  const [searchTerm, setSearchTerm] = useState("")
  const [institution, setInstitution] = useState("todas")
  const [listName, setListName] = useState("")
  const [selectedLists, setSelectedLists] = useState<SendingList[]>([])
  
  // Estado para resultados de búsqueda
  const [searchResults, setSearchResults] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para datos seleccionados
  const [sender, setSender] = useState<ApiUser | null>(null)
  const [toRecipients, setToRecipients] = useState<ApiUser[]>([])
  const [ccRecipients, setCcRecipients] = useState<ApiUser[]>([])
  
  // Estado para listas de distribución
  const [distributionLists, setDistributionLists] = useState<SendingList[]>([])
  const [filteredLists, setFilteredLists] = useState<SendingList[]>([])
  const [listSearchTerm, setListSearchTerm] = useState("")
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedListMembers, setSelectedListMembers] = useState<ApiUser[]>([])
  const [isLoadingListMembers, setIsLoadingListMembers] = useState(false)
  
  // Estado para la creación de listas
  const [showCreateListForm, setShowCreateListForm] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [isCreatingList, setIsCreatingList] = useState(false)
  
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
  
  // Cargar listas de distribución
  const fetchDistributionLists = useCallback(async () => {
    try {
      setIsLoadingLists(true)
      setListError(null)
      
      const response = await apiClient.getDistributionLists()
      
      if (response && response.success) {
        console.log("✅ Listas de distribución cargadas:", response.data)
        setDistributionLists(response.data)
        setFilteredLists(response.data)
      } else {
        throw new Error(response?.message || "Error al cargar listas de distribución")
      }
    } catch (err) {
      console.error("Error loading distribution lists:", err)
      setListError(err instanceof Error ? err.message : "Error al cargar listas de distribución")
      // Mantener las listas existentes si hay un error
    } finally {
      setIsLoadingLists(false)
    }
  }, [])
  
  // Cargar miembros de la lista seleccionada
  const fetchListMembers = useCallback(async (listId: string) => {
    if (!listId) return
    
    try {
      setIsLoadingListMembers(true)
      
      const response = await apiClient.getDistributionListMembers(listId)
      
      if (response && response.success) {
        console.log(`✅ Miembros de la lista ${listId} cargados:`, response.data)
        setSelectedListMembers(response.data)
      } else {
        throw new Error(response?.message || `Error al cargar miembros de la lista ${listId}`)
      }
    } catch (err) {
      console.error(`Error loading members for list ${listId}:`, err)
      setSelectedListMembers([])
      // Mostrar un toast o mensaje de error
    } finally {
      setIsLoadingListMembers(false)
    }
  }, [])
  
  // Función para determinar el estado del último acceso (para el ícono de semáforo)
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

  // Función para renderizar el círculo de estado de último acceso
  const renderLastAccessCircle = (status: "green" | "yellow" | "red") => {
    const colorMap = {
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    };

    return (
      <div className={`w-2.5 h-2.5 rounded-full ${colorMap[status]}`} title={`Último acceso: ${status === 'green' ? 'reciente' : status === 'yellow' ? 'hace un tiempo' : 'hace mucho tiempo'}`} />
    );
  };
  
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
    // Si este usuario ya está como destinatario, eliminarlo de esos estados
    const isInTo = toRecipients.some(r => r.userId === user.userId);
    const isInCc = ccRecipients.some(r => r.userId === user.userId);
    
    if (isInTo) {
      console.log("⚠️ Usuario ya estaba en TO, eliminándolo de ahí")
      setToRecipients(toRecipients.filter(r => r.userId !== user.userId))
    }
    
    if (isInCc) {
      console.log("⚠️ Usuario ya estaba en CC, eliminándolo de ahí")
      setCcRecipients(ccRecipients.filter(r => r.userId !== user.userId))
    }
    
    // Establecer como remitente
    setSender(user)
    console.log("✅ Usuario establecido como remitente:", user.fullName)
  }
  
  // Manejar selección de destinatario principal
  const handleSelectTo = (user: ApiUser) => {
    // Verificar si ya está en otro estado
    const isInCc = ccRecipients.some(r => r.userId === user.userId);
    const isCurrentSender = sender?.userId === user.userId;
    
    // Si está en CC, eliminarlo de ahí
    if (isInCc) {
      console.log("⚠️ Usuario ya estaba en CC, eliminándolo de ahí")
      setCcRecipients(ccRecipients.filter(r => r.userId !== user.userId))
    }
    
    // Si es el remitente actual, eliminarlo de ahí
    if (isCurrentSender) {
      console.log("⚠️ Usuario ya era el remitente, eliminándolo de ahí")
      setSender(null)
    }
    
    // Si no está ya en TO, añadirlo
    if (!toRecipients.some(r => r.userId === user.userId)) {
      setToRecipients([...toRecipients, user])
      console.log("✅ Usuario añadido como destinatario TO:", user.fullName)
    }
  }
  
  // Manejar selección de destinatario en copia
  const handleSelectCc = (user: ApiUser) => {
    // Verificar si ya está en otro estado
    const isInTo = toRecipients.some(r => r.userId === user.userId);
    const isCurrentSender = sender?.userId === user.userId;
    
    // Si está en TO, eliminarlo de ahí
    if (isInTo) {
      console.log("⚠️ Usuario ya estaba en TO, eliminándolo de ahí")
      setToRecipients(toRecipients.filter(r => r.userId !== user.userId))
    }
    
    // Si es el remitente actual, eliminarlo de ahí
    if (isCurrentSender) {
      console.log("⚠️ Usuario ya era el remitente, eliminándolo de ahí")
      setSender(null)
    }
    
    // Si no está ya en CC, añadirlo
    if (!ccRecipients.some(r => r.userId === user.userId)) {
      setCcRecipients([...ccRecipients, user])
      console.log("✅ Usuario añadido como destinatario CC:", user.fullName)
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
    if (!listName) return
    
    // Por ahora solo mostramos la lista de miembros
    fetchListMembers(listName)
  }
  
  // Manejar añadir lista a destinatarios
  const handleAddListTo = async (list: SendingList) => {
    try {
      if (!list || !list.id) return
      
      // Obtener los miembros de la lista si no los tenemos
      if (selectedListMembers.length === 0) {
        await fetchListMembers(list.id)
      }
      
      // Si tenemos miembros, añadirlos a los destinatarios
      if (selectedListMembers.length > 0) {
        // Filtrar miembros que ya están en la lista de destinatarios
        const newRecipients = selectedListMembers.filter(
          member => !toRecipients.some(r => r.userId === member.userId)
        )
        
        // Actualizar estado si hay nuevos destinatarios
        if (newRecipients.length > 0) {
          // Verificar si alguno ya está en CC y eliminarlo de ahí
          const updatedCcRecipients = ccRecipients.filter(
            cc => !newRecipients.some(nr => nr.userId === cc.userId)
          )
          
          // Actualizar estados
          setToRecipients([...toRecipients, ...newRecipients])
          setCcRecipients(updatedCcRecipients)
          
          console.log(`✅ Añadidos ${newRecipients.length} miembros de la lista "${list.name}" como destinatarios principales`)
          
          // Mostrar notificación de éxito
          toast({
            title: "Lista añadida",
            description: `${newRecipients.length} miembros de "${list.name}" añadidos como destinatarios principales`,
            variant: "success",
          })
        } else {
          console.log("ℹ️ Todos los miembros de la lista ya están añadidos como destinatarios")
          
          // Mostrar notificación informativa
          toast({
            title: "Información",
            description: "Todos los miembros de la lista ya están añadidos como destinatarios",
            variant: "default",
          })
        }
      } else {
        console.log("⚠️ No hay miembros en la lista seleccionada")
        
        // Mostrar notificación de advertencia
        toast({
          title: "Lista vacía",
          description: "No hay miembros en la lista seleccionada",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding list members as TO recipients:", error)
      
      // Mostrar notificación de error
      toast({
        title: "Error",
        description: "No se pudieron añadir los miembros de la lista como destinatarios principales",
        variant: "destructive",
      })
    }
  }
  
  // Manejar añadir lista a destinatarios en copia
  const handleAddListCc = async (list: SendingList) => {
    try {
      if (!list || !list.id) return
      
      // Obtener los miembros de la lista si no los tenemos
      if (selectedListMembers.length === 0) {
        await fetchListMembers(list.id)
      }
      
      // Si tenemos miembros, añadirlos a los destinatarios en copia
      if (selectedListMembers.length > 0) {
        // Filtrar miembros que ya están en la lista de destinatarios en copia
        const newRecipients = selectedListMembers.filter(
          member => !ccRecipients.some(r => r.userId === member.userId)
        )
        
        // Actualizar estado si hay nuevos destinatarios
        if (newRecipients.length > 0) {
          // Verificar si alguno ya está en TO y eliminarlo de ahí
          const updatedToRecipients = toRecipients.filter(
            to => !newRecipients.some(nr => nr.userId === to.userId)
          )
          
          // Actualizar estados
          setCcRecipients([...ccRecipients, ...newRecipients])
          setToRecipients(updatedToRecipients)
          
          console.log(`✅ Añadidos ${newRecipients.length} miembros de la lista "${list.name}" como destinatarios en copia`)
          
          // Mostrar notificación de éxito
          toast({
            title: "Lista añadida",
            description: `${newRecipients.length} miembros de "${list.name}" añadidos como destinatarios en copia`,
            variant: "success",
          })
        } else {
          console.log("ℹ️ Todos los miembros de la lista ya están añadidos como destinatarios en copia")
          
          // Mostrar notificación informativa
          toast({
            title: "Información",
            description: "Todos los miembros de la lista ya están añadidos como destinatarios en copia",
            variant: "default",
          })
        }
      } else {
        console.log("⚠️ No hay miembros en la lista seleccionada")
        
        // Mostrar notificación de advertencia
        toast({
          title: "Lista vacía",
          description: "No hay miembros en la lista seleccionada",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding list members as CC recipients:", error)
      
      // Mostrar notificación de error
      toast({
        title: "Error",
        description: "No se pudieron añadir los miembros de la lista como destinatarios en copia",
        variant: "destructive",
      })
    }
  }
  
  // Manejar aceptar selección
  const handleAccept = () => {
    console.log("⭐ Ejecutando handleAccept")
    console.log("💼 Datos a enviar:", { sender, toRecipients, ccRecipients })
    
    // Crear mapas para identificar destinatarios existentes por ID
    const existingRecipientsMap = new Map();
    existingRecipients.forEach(recipient => {
      existingRecipientsMap.set(recipient.id, {
        ...recipient,
        exists: true
      });
    });
    
    // Crear mapas para identificar destinatarios seleccionados por ID
    const selectedToMap = new Map();
    toRecipients.forEach(recipient => {
      selectedToMap.set(recipient.userId.toString(), recipient);
    });
    
    const selectedCcMap = new Map();
    ccRecipients.forEach(recipient => {
      selectedCcMap.set(recipient.userId.toString(), recipient);
    });
    
    // Identificar destinatarios eliminados (estaban en existingRecipients pero no en los seleccionados)
    existingRecipients.forEach(existingRecipient => {
      const recipientId = existingRecipient.id;
      
      // Verificar si el destinatario ya no está seleccionado
      if (existingRecipient.type === "to" && !selectedToMap.has(recipientId)) {
        console.log("🗑️ Eliminando destinatario TO:", existingRecipient)
        // Enviar null para eliminar este destinatario
        onRecipientSelect(null, "to", recipientId)
      }
      
      if (existingRecipient.type === "cc" && !selectedCcMap.has(recipientId)) {
        console.log("🗑️ Eliminando destinatario CC:", existingRecipient)
        // Enviar null para eliminar este destinatario
        onRecipientSelect(null, "cc", recipientId)
      }
    });
    
    // Manejar remitente - siempre enviar el remitente actual (o null si se eliminó)
    const senderData = sender ? {
      id: sender.userId.toString(),
      name: sender.fullName,
      email: sender.email,
      institution: sender.departmentName,
      position: sender.position
    } : null;
    
    // Verificar si el remitente cambió o se eliminó
    const senderChanged = 
      // No había remitente antes y ahora hay uno
      (!currentSender && sender) || 
      // Había remitente antes y ahora no hay
      (currentSender && !sender) || 
      // Ambos existen pero son diferentes
      (currentSender && sender && currentSender.id !== sender.userId.toString());
    
    // Siempre enviar el remitente para garantizar sincronización
    console.log("📤 Enviando remitente actual:", senderData, "cambió:", senderChanged)
    onSenderSelect(senderData)
    
    // Primero, recopilamos todos los destinatarios actuales para una actualización completa
    const currentToRecipients = toRecipients.map(recipient => ({
      id: recipient.userId.toString(),
      name: recipient.fullName,
      email: recipient.email,
      institution: recipient.departmentName,
      position: recipient.position
    }));
    
    const currentCcRecipients = ccRecipients.map(recipient => ({
      id: recipient.userId.toString(),
      name: recipient.fullName,
      email: recipient.email,
      institution: recipient.departmentName,
      position: recipient.position
    }));
    
    console.log("📊 Estado actual de destinatarios:", {
      to: currentToRecipients,
      cc: currentCcRecipients
    });
    
    // Primero, eliminar todos los destinatarios existentes que ya no están seleccionados
    existingRecipients.forEach(existingRecipient => {
      const recipientId = existingRecipient.id;
      
      // Verificar si el destinatario ya no está seleccionado
      if (existingRecipient.type === "to" && !selectedToMap.has(recipientId)) {
        console.log("🗑️ Eliminando destinatario TO:", existingRecipient)
        // Enviar null para eliminar este destinatario
        onRecipientSelect(null, "to", recipientId)
      }
      
      if (existingRecipient.type === "cc" && !selectedCcMap.has(recipientId)) {
        console.log("🗑️ Eliminando destinatario CC:", existingRecipient)
        // Enviar null para eliminar este destinatario
        onRecipientSelect(null, "cc", recipientId)
      }
    });
    
    // Ahora, enviar todos los destinatarios actuales para garantizar sincronización
    toRecipients.forEach(recipient => {
      const recipientData = {
        id: recipient.userId.toString(),
        name: recipient.fullName,
        email: recipient.email,
        institution: recipient.departmentName,
        position: recipient.position
      };
      
      console.log("📤 Enviando destinatario TO:", recipientData)
      // Siempre enviar para garantizar la sincronización
      onRecipientSelect(recipientData, "to")
    });
    
    ccRecipients.forEach(recipient => {
      const recipientData = {
        id: recipient.userId.toString(),
        name: recipient.fullName,
        email: recipient.email,
        institution: recipient.departmentName,
        position: recipient.position
      };
      
      console.log("📤 Enviando destinatario CC:", recipientData)
      // Siempre enviar para garantizar la sincronización
      onRecipientSelect(recipientData, "cc")
    });
    
    console.log("🔒 Cerrando modal después de enviar datos")
    onClose()
  }
  
  // Manejar crear ciudadano
  const handleCreateCitizen = () => {
    alert("Funcionalidad de crear ciudadano aún no implementada")
  }
  
  // Manejar crear lista
  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la lista es obligatorio",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsCreatingList(true)
      
      const response = await apiClient.createDistributionList({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined
      })
      
      if (response && response.success) {
        console.log("✅ Lista creada:", response.data)
        
        // Añadir la nueva lista al estado
        setDistributionLists(prev => [response.data, ...prev])
        setFilteredLists(prev => [response.data, ...prev])
        
        // Seleccionar la nueva lista
        setListName(response.data.id)
        
        // Mostrar notificación de éxito
        toast({
          title: "Lista creada",
          description: `La lista "${response.data.name}" ha sido creada correctamente`,
          variant: "success",
        })
        
        // Cerrar formulario y limpiar campos
        setShowCreateListForm(false)
        setNewListName("")
        setNewListDescription("")
      } else {
        throw new Error(response?.message || "Error al crear la lista")
      }
    } catch (error) {
      console.error("Error creating list:", error)
      
      toast({
        title: "Error",
        description: "No se pudo crear la lista. Inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingList(false)
    }
  }

  // Buscar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    // Solo ejecutar cuando el modal está abierto
    if (isOpen) {
      // Buscar si hay al menos 2 caracteres o si está vacío
      if (searchTerm.length >= 2 || searchTerm === "") {
        searchUsers()
      }
    }
  }, [searchTerm, searchUsers, isOpen])

  // Cargar listas de distribución al abrir el modal
  useEffect(() => {
    // Solo ejecutar cuando se abre el modal y se activa la pestaña de listas
    if (isOpen && activeTab === 'list') {
      fetchDistributionLists()
    }
  }, [isOpen, activeTab, fetchDistributionLists])

  // Inicializar estados cuando se abre el modal
  useEffect(() => {
    // Solo ejecutar cuando se abre el modal
    if (isOpen) {
      console.log("🔄 Inicializando estados del modal con datos existentes:", { currentSender, existingRecipients })
      
      // Limpiar la caja de búsqueda
      setSearchTerm("")
      
      // Inicializar remitente si existe
      if (currentSender) {
        // Buscar en resultados existentes o crear un objeto compatible con ApiUser
        const senderApiUser: ApiUser = {
          userId: parseInt(currentSender.id) || 0,
          username: "", // No tenemos esta información
          identification: "", // No tenemos esta información
          email: currentSender.email,
          firstName: "", // No tenemos esta información
          lastName: "", // No tenemos esta información
          fullName: currentSender.name,
          departmentName: currentSender.institution || "",
          departmentId: 0, // No tenemos esta información
          position: currentSender.position || "",
          registrationDate: new Date().toISOString(), // Valor por defecto
          lastAccess: new Date().toISOString(), // Valor por defecto
          extendedDataId: 0 // No tenemos esta información
        };
        
        setSender(senderApiUser);
        console.log("✅ Remitente inicializado:", senderApiUser);
      } else {
        setSender(null);
      }
      
      // Inicializar destinatarios existentes
      const toRecipientsArray: ApiUser[] = [];
      const ccRecipientsArray: ApiUser[] = [];
      
      existingRecipients.forEach(recipient => {
        const recipientApiUser: ApiUser = {
          userId: parseInt(recipient.id) || 0,
          username: "", // No tenemos esta información
          identification: "", // No tenemos esta información
          email: recipient.email,
          firstName: "", // No tenemos esta información
          lastName: "", // No tenemos esta información
          fullName: recipient.name,
          departmentName: recipient.institution || "",
          departmentId: 0, // No tenemos esta información
          position: recipient.position || "",
          registrationDate: new Date().toISOString(), // Valor por defecto
          lastAccess: new Date().toISOString(), // Valor por defecto
          extendedDataId: 0 // No tenemos esta información
        };
        
        // Añadir a la lista correspondiente según su tipo
        if (recipient.type === "to") {
          toRecipientsArray.push(recipientApiUser);
        } else if (recipient.type === "cc") {
          ccRecipientsArray.push(recipientApiUser);
        }
      });
      
      // Actualizar estados
      if (toRecipientsArray.length > 0) {
        setToRecipients(toRecipientsArray);
        console.log("✅ Destinatarios 'TO' inicializados:", toRecipientsArray);
      } else {
        setToRecipients([]);
      }
      
      if (ccRecipientsArray.length > 0) {
        setCcRecipients(ccRecipientsArray);
        console.log("✅ Destinatarios 'CC' inicializados:", ccRecipientsArray);
      } else {
        setCcRecipients([]);
      }
      
      // La búsqueda inicial se realizará automáticamente por el otro efecto
      // cuando cambie searchTerm a vacío
    }
  }, [isOpen, currentSender, existingRecipients]) // Dependencias: isOpen, currentSender, existingRecipients

  // Estado para controlar el portal en entorno de cliente
  const [mounted, setMounted] = useState(false)
  
  // Efecto para gestionar el montaje del portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  // Efecto para manejar interacción con el cuerpo del documento
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      // Evitar scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
      
      // Añadir clase para aplicar estilos CSS que afectan al z-index
      document.body.classList.add('modal-open')
      
      return () => {
        // Restaurar scroll
        document.body.style.overflow = ''
        
        // Eliminar la clase al cerrar el modal
        document.body.classList.remove('modal-open')
      }
    }
  }, [isOpen])

  if (!isOpen) return null
  
  // Verificar si estamos en el navegador antes de renderizar el portal
  if (!mounted) return null
  
  // Prevenir errores de hidratación en Next.js verificando que document esté definido
  if (typeof document === 'undefined') return null

  // Renderizar el modal en un portal fuera de la jerarquía normal del DOM
  return createPortal(
    <div 
      className="fixed inset-0 flex items-start justify-center pt-[40px] bg-black/50"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10000,
        isolation: 'isolate' // Crear un nuevo contexto de apilamiento
      }}
    >
      <div className="w-[95%] max-w-[1100px] bg-white rounded-md shadow-lg overflow-hidden flex flex-col h-[calc(100vh-80px)]">
        {/* Encabezado */}
        <header className="p-2 border-b flex justify-between items-center bg-gray-100">
          <h2 className="text-base font-medium text-gray-800">Seleccionar Remitente y Destinatarios</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center h-6 w-6 rounded-md hover:bg-gray-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Cuerpo Principal (Layout de 2 columnas) */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* Columna Izquierda: Búsqueda y Resultados */}
          <div className="w-full md:w-3/5 border-r flex flex-col overflow-hidden">
            {/* Pestañas */}
            <div className="flex border-b bg-gray-50">
              <button 
                onClick={() => setActiveTab('search')}
                className={cn(
                  "py-2 px-3 text-gray-600 border-b-2 transition-colors flex items-center text-xs",
                  activeTab === 'search' 
                    ? "border-gray-700 text-gray-800 font-medium" 
                    : "border-transparent hover:text-gray-700"
                )}
              >
                <Search className="h-3 w-3 mr-1" />
                Buscar Persona
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={cn(
                  "py-2 px-3 text-gray-600 border-b-2 transition-colors flex items-center text-xs",
                  activeTab === 'list' 
                    ? "border-gray-700 text-gray-800 font-medium" 
                    : "border-transparent hover:text-gray-700"
                )}
              >
                <List className="h-3 w-3 mr-1" />
                Usar Lista de Envío
              </button>
            </div>

            {/* Contenido de Pestañas */}
            <div className="flex-grow overflow-hidden">
              {/* Pestaña 1: Buscar Persona */}
              {activeTab === 'search' && (
                <>
                  <div className="p-2 space-y-2 bg-gray-50">
                    <div>
                      <label htmlFor="user_data" className="block text-xs font-medium text-gray-700 mb-1">Datos del Usuario</label>
                      <div className="relative">
                        <Input
                          id="user_data"
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar por cédula, nombre, cargo, correo..."
                          className="pl-7 pr-4 py-1 w-full h-8 text-xs border-gray-300"
                        />
                        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                        {isLoading && (
                          <Loader2 className="absolute right-2 top-2 h-3.5 w-3.5 animate-spin text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Escriba al menos 2 caracteres para filtrar resultados</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="institution" className="block text-xs font-medium text-gray-700 mb-1">Institución</label>
                        <Select value={institution} onValueChange={setInstitution}>
                          <SelectTrigger id="institution" className="w-full h-8 text-xs border-gray-300">
                            <SelectValue placeholder="Seleccionar institución" />
                          </SelectTrigger>
                          <SelectContent>
                            {institutionOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label htmlFor="user_type" className="block text-xs font-medium text-gray-700 mb-1">Tipo de Usuario</label>
                        <Select value={userType} onValueChange={setUserType}>
                          <SelectTrigger id="user_type" className="w-full h-8 text-xs border-gray-300">
                            <SelectValue placeholder="Seleccionar tipo de usuario" />
                          </SelectTrigger>
                          <SelectContent>
                            {userTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resultados de Búsqueda */}
                  <div className="p-2 flex flex-col flex-1 overflow-hidden"> {/* Contenedor padre con flexbox */}
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-gray-700 text-xs">Resultados de la Búsqueda</h3>
                      {searchResults && searchResults.length > 0 && (
                        <span className="text-gray-500 text-xs">{searchResults.length} encontrados</span>
                      )}
                    </div>
                    
                    {/* Gestión de estados de búsqueda */}
                    {error && (
                      <div className="p-2 text-center">
                        <p className="text-gray-700 text-xs">{error}</p>
                        <Button 
                          onClick={searchUsers} 
                          className="mt-2 h-7 text-xs bg-gray-600 hover:bg-gray-700"
                          size="sm"
                        >
                          Reintentar
                        </Button>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="p-4 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    )}
                    
                    {!isLoading && !error && (!searchResults || searchResults.length === 0) && (
                      <div className="p-4 text-center text-gray-500">
                        <Users className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-xs">No se encontraron resultados</p>
                        <p className="text-xs">Intente con otros criterios de búsqueda</p>
                      </div>
                    )}
                    
                    {!isLoading && !error && searchResults && searchResults.length > 0 && (
                      <div className="space-y-1 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0">
                        {searchResults.map((user) => {
                          const isDeSelected = sender?.userId === user.userId;
                          const isToSelected = toRecipients.some(r => r.userId === user.userId);
                          const isCcSelected = ccRecipients.some(r => r.userId === user.userId);
                          
                          return (
                            <div key={user.userId} className="border border-gray-200 p-2 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                  <p className="font-medium text-gray-800 text-xs">
                                    {user.fullName} 
                                    <span className="text-xs font-normal text-gray-500 ml-1">
                                      ({user.username?.includes("admin") ? "Serv." : "Ciu."})
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-600">{user.position}</p>
                                  <p className="text-xs text-gray-500">{user.departmentName}</p>
                                  <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <Key className="h-3 w-3 text-gray-500" />
                                  <div className={`w-2 h-2 rounded-full ${
                                    getLastAccessStatus(user.lastAccess) === 'green' ? 'bg-gray-700' : 
                                    getLastAccessStatus(user.lastAccess) === 'yellow' ? 'bg-gray-500' : 
                                    'bg-gray-400'
                                  }`} />
                                </div>
                              </div>
                              <div className="flex gap-1 mt-2 justify-end">
                                <Button
                                  size="sm"
                                  variant={isDeSelected ? "secondary" : "outline"}
                                  onClick={() => handleSelectSender(user)}
                                  disabled={isDeSelected}
                                  className={cn(
                                    "px-2 py-0 text-xs h-6",
                                    isDeSelected ? "bg-gray-300 text-gray-500" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                                  )}
                                >
                                  {isDeSelected ? (
                                    <Check className="h-3 w-3 mr-0.5" />
                                  ) : (
                                    "+"
                                  )} 
                                  De
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isToSelected ? "secondary" : "outline"}
                                  onClick={() => handleSelectTo(user)}
                                  disabled={isToSelected}
                                  className={cn(
                                    "px-2 py-0 text-xs h-6",
                                    isToSelected ? "bg-gray-300 text-gray-500" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                                  )}
                                >
                                  {isToSelected ? (
                                    <Check className="h-3 w-3 mr-0.5" />
                                  ) : (
                                    "+"
                                  )} 
                                  Para
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isCcSelected ? "secondary" : "outline"}
                                  onClick={() => handleSelectCc(user)}
                                  disabled={isCcSelected}
                                  className={cn(
                                    "px-2 py-0 text-xs h-6",
                                    isCcSelected ? "bg-gray-300 text-gray-500" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                                  )}
                                >
                                  {isCcSelected ? (
                                    <Check className="h-3 w-3 mr-0.5" />
                                  ) : (
                                    "+"
                                  )} 
                                  Copia
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Pestaña 2: Usar Lista de Envío */}
              {activeTab === 'list' && (
                <div className="p-2 space-y-2">
                  {/* Búsqueda de listas */}
                  <div>
                    <label htmlFor="list_search" className="block text-xs font-medium text-gray-700 mb-1">Buscar Lista</label>
                    <div className="relative">
                      <Input
                        id="list_search"
                        type="text"
                        value={listSearchTerm}
                        onChange={(e) => {
                          const term = e.target.value;
                          setListSearchTerm(term);
                          
                          // Filtrar listas según el término de búsqueda
                          if (term.trim() === "") {
                            setFilteredLists(distributionLists);
                          } else {
                            const filtered = distributionLists.filter(list => 
                              list.name.toLowerCase().includes(term.toLowerCase()) ||
                              (list.description && list.description.toLowerCase().includes(term.toLowerCase()))
                            );
                            setFilteredLists(filtered);
                          }
                        }}
                        placeholder="Buscar por nombre o descripción..."
                        className="pl-7 pr-4 py-1 w-full h-8 text-xs border-gray-300"
                      />
                      <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                      {isLoadingLists && (
                        <Loader2 className="absolute right-2 top-2 h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="distribution_list" className="text-xs font-medium text-gray-700">Seleccionar Lista</label>
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 text-xs py-0 px-2 flex items-center gap-1 bg-gray-50"
                          onClick={() => setShowCreateListForm(!showCreateListForm)}
                        >
                          {showCreateListForm ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              <span>Cancelar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              <span>Nueva</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {showCreateListForm ? (
                      <div className="mb-3 p-3 border rounded-md bg-gray-50">
                        <h4 className="font-medium text-sm mb-2">Crear nueva lista</h4>
                        <div className="space-y-2 mb-3">
                          <div>
                            <Label htmlFor="list-name" className="text-xs">Nombre de la lista</Label>
                            <Input
                              id="list-name"
                              placeholder="Ej: Directores de Área"
                              value={newListName}
                              onChange={(e) => setNewListName(e.target.value)}
                              className="text-xs h-8 mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="list-description" className="text-xs">Descripción (opcional)</Label>
                            <Input
                              id="list-description"
                              placeholder="Ej: Lista para comunicaciones oficiales"
                              value={newListDescription}
                              onChange={(e) => setNewListDescription(e.target.value)}
                              className="text-xs h-8 mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowCreateListForm(false);
                              setNewListName("");
                              setNewListDescription("");
                            }}
                            className="h-7 text-xs"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            onClick={handleCreateList}
                            disabled={isCreatingList || !newListName.trim()}
                            className="h-7 text-xs"
                            size="sm"
                          >
                            {isCreatingList ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Creando...
                              </>
                            ) : (
                              "Crear lista"
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                      <Select value={listName} onValueChange={(value) => {
                        setListName(value);
                        // Cargar miembros automáticamente al seleccionar una lista
                        if (value) fetchListMembers(value);
                      }}>
                        <SelectTrigger id="distribution_list" className="flex-grow h-8 text-xs border-gray-300">
                          <SelectValue placeholder="Seleccione una lista" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingLists ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span className="text-xs">Cargando listas...</span>
                            </div>
                          ) : listError ? (
                            <div className="flex items-center justify-center p-2 text-red-500">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              <span className="text-xs">Error al cargar listas</span>
                            </div>
                          ) : distributionLists.length === 0 ? (
                            <div className="p-2 text-center text-gray-500">
                              <span className="text-xs">No hay listas disponibles</span>
                            </div>
                          ) : filteredLists.length === 0 ? (
                            <div className="p-2 text-center text-gray-500">
                              <span className="text-xs">No se encontraron listas</span>
                            </div>
                          ) : (
                            filteredLists.map(list => (
                              <SelectItem key={list.id} value={list.id} className="text-xs">
                                {list.name} ({list.members} miembros)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handleEditList} 
                        disabled={!listName || isLoadingListMembers}
                        className="h-8 w-8 border-gray-300"
                        title="Ver miembros de la lista"
                      >
                        <Users className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handleClearListName} 
                        disabled={!listName}
                        className="h-8 w-8 border-gray-300"
                        title="Limpiar selección"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    )}
                  </div>
                  
                  {/* Información de la lista seleccionada */}
                  {listName && (
                    <div className="p-2 border rounded border-gray-200 bg-gray-50">
                      <div className="font-medium text-xs text-gray-800">
                        {distributionLists.find(l => l.id === listName)?.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {distributionLists.find(l => l.id === listName)?.description}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        Miembros: {distributionLists.find(l => l.id === listName)?.members}
                      </div>
                    </div>
                  )}
                  
                  {/* Miembros de la lista */}
                  {isLoadingListMembers ? (
                    <div className="p-4 flex justify-center items-center space-x-2 bg-gray-50 rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs text-gray-600">Cargando miembros...</span>
                    </div>
                  ) : listName && selectedListMembers.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border rounded border-gray-200 bg-white p-1">
                      <div className="text-xs font-medium text-gray-700 mb-1 px-1">Miembros de la lista</div>
                      {selectedListMembers.map(member => (
                        <div key={member.userId} className="text-xs p-1 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="font-medium">{member.fullName}</div>
                          <div className="text-gray-500">{member.position} - {member.departmentName}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 h-7 text-xs" 
                      variant="secondary"
                      onClick={() => {
                        const selectedList = distributionLists.find(l => l.id === listName);
                        if (selectedList) handleAddListTo(selectedList);
                      }}
                      disabled={!listName || isLoadingListMembers}
                      size="sm"
                    >
                      {isLoadingListMembers ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Cargando...
                        </>
                      ) : (
                        "Añadir como \"Para\""
                      )}
                    </Button>
                    <Button 
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 h-7 text-xs" 
                      variant="secondary"
                      onClick={() => {
                        const selectedList = distributionLists.find(l => l.id === listName);
                        if (selectedList) handleAddListCc(selectedList);
                      }}
                      disabled={!listName || isLoadingListMembers}
                      size="sm"
                    >
                      {isLoadingListMembers ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Cargando...
                        </>
                      ) : (
                        "Añadir como \"Copia\""
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Selección Final */}
          <div className="w-full md:w-2/5 flex flex-col bg-gray-50 overflow-hidden">
            <div className="p-2 border-b bg-gray-100">
              <h3 className="text-sm font-medium text-gray-800">Datos a Colocar en el Documento</h3>
            </div>
            
            <div className="flex-grow p-2 space-y-2 overflow-y-auto custom-scrollbar h-full">
              {/* Remitente (De) */}
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">De: (Remitente)</h4>
                <div className="bg-white p-2 rounded border border-gray-300 min-h-[40px] flex items-center">
                  {sender ? (
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="font-medium text-xs text-gray-800">{sender.fullName}</p>
                        <p className="text-xs text-gray-500">{sender.departmentName}</p>
                      </div>
                      <button 
                        onClick={handleRemoveSender}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 w-full text-center">Seleccione un remitente</span>
                  )}
                </div>
              </div>
              
              {/* Destinatarios (Para) */}
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">Para: (Destinatarios)</h4>
                <div className="bg-white p-1 rounded border border-gray-300 min-h-[80px] space-y-1">
                  {toRecipients.length > 0 ? (
                    toRecipients.map(recipient => (
                      <div key={recipient.userId} className="flex justify-between items-center bg-gray-100 p-1 rounded border border-gray-200">
                        <div>
                          <p className="font-medium text-xs text-gray-800">{recipient.fullName}</p>
                          <p className="text-xs text-gray-500">{recipient.departmentName}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveTo(recipient.userId)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 py-1 flex items-center justify-center">Añada destinatarios desde la búsqueda</span>
                  )}
                </div>
              </div>
              
              {/* Con Copia (Copia) */}
              <div>
                <h4 className="font-medium text-gray-700 mb-1 text-xs">CC: (Con Copia)</h4>
                <div className="bg-white p-1 rounded border border-gray-300 min-h-[80px] space-y-1">
                  {ccRecipients.length > 0 ? (
                    ccRecipients.map(recipient => (
                      <div key={recipient.userId} className="flex justify-between items-center bg-gray-100 p-1 rounded border border-gray-200">
                        <div>
                          <p className="font-medium text-xs text-gray-800">{recipient.fullName}</p>
                          <p className="text-xs text-gray-500">{recipient.departmentName}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveCc(recipient.userId)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 py-1 flex items-center justify-center">Añada copias desde la búsqueda</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de la Modal */}
        <footer className="p-2 border-t flex justify-between items-center bg-gray-100">
          {userType === 'ciudadano' && (
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 h-7 text-xs"
              size="sm"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Crear Ciudadano
            </Button>
          )}
          
          {userType !== 'ciudadano' && <div></div>}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-7 text-xs border-gray-300"
              size="sm"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gray-700 hover:bg-gray-800 h-7 text-xs" 
              onClick={() => {
                console.log("🔘 Botón Aceptar pulsado - ejecutando handleAccept y cerrando modal")
                
                // Ejecutar la función de manejar aceptar
                handleAccept()
                
                // Forzar el cierre del modal después de enviar los datos
                setTimeout(() => {
                  console.log("⏱️ Cerrando modal con timeout para garantizar que se envíen los datos")
                  onClose()
                }, 100)
              }}
              // Siempre habilitado para permitir guardar eliminaciones
              disabled={false}
              size="sm"
            >
              Aceptar
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  )
}

// Estilos adicionales para el scrollbar personalizado y modal
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

/* Estilos para que el modal se muestre sobre el header */
body.modal-open .document-header {
  z-index: 10 !important; /* Forzar un z-index bajo cuando el modal está abierto */
}
`;

// Añadir estilos al documento
if (typeof document !== 'undefined') {
  // Verificar si ya existe un estilo con este contenido para evitar duplicados
  const existingStyle = document.querySelector('style[data-custom-scrollbar]');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-custom-scrollbar', 'true');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}