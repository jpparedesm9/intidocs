"use client"

import type React from "react"

import { useState } from "react"
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ListIcon,
  LayoutGrid,
  Filter,
  Edit,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Tramite {
  id: string
  estado: "pendiente" | "en_proceso" | "revision" | "aprobado" | "rechazado" | "finalizado"
  responsable: string
  fechaIngreso: string
  ultimaActualizacion: string
  titulo: string
  solicitante: string
  descripcion: string
  isSelected?: boolean
}

export function AdministrationManagement() {
  // Establecer estilo para garantizar interactividad
  const containerStyle = {
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
    height: '100%',
    width: '100%',
    zIndex: 10,
    overflow: 'auto'
  };
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTramites, setSelectedTramites] = useState<string[]>([])
  const [selectedTramiteId, setSelectedTramiteId] = useState<string | null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [filterResponsable, setFilterResponsable] = useState("Todos")
  const [filterEstado, setFilterEstado] = useState("Todos")

  // Sample tramites data
  const tramites: Tramite[] = [
    {
      id: "001",
      estado: "pendiente",
      responsable: "Ana M.",
      fechaIngreso: "01/05/2024",
      ultimaActualizacion: "02/05/2024",
      titulo: "Solicitud de Licencia Ambiental",
      solicitante: "Carlos Vera",
      descripcion: "Solicitud para obtener licencia ambiental para proyecto minero en zona norte.",
    },
    {
      id: "002",
      estado: "en_proceso",
      responsable: "Carlos V.",
      fechaIngreso: "02/05/2024",
      ultimaActualizacion: "03/05/2024",
      titulo: "Emisión de Certificado TRM",
      solicitante: "María López",
      descripcion: "Emisión de certificado TRM para importación de maquinaria industrial.",
    },
    {
      id: "003",
      estado: "aprobado",
      responsable: "Juan P.",
      fechaIngreso: "03/05/2024",
      ultimaActualizacion: "10/05/2024",
      titulo: "Análisis de Propuesta Comercial",
      solicitante: "Empresa ABC S.A.",
      descripcion: "Análisis y aprobación de propuesta comercial para nuevo cliente corporativo.",
    },
    {
      id: "004",
      estado: "pendiente",
      responsable: "Ana M.",
      fechaIngreso: "02/05/2024",
      ultimaActualizacion: "02/05/2024",
      titulo: "Actualización Base de Datos Proveedores",
      solicitante: "Departamento de Compras",
      descripcion: "Actualización de información de contacto y condiciones comerciales de proveedores.",
    },
    {
      id: "ABC-123",
      estado: "pendiente",
      responsable: "Carlos V.",
      fechaIngreso: "06/05/2024",
      ultimaActualizacion: "06/05/2024",
      titulo: "Solicitud de Permiso Ambiental",
      solicitante: "Eduardo Topon",
      descripcion: "Solicitud de permiso ambiental para construcción de planta industrial.",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendiente
          </Badge>
        )
      case "en_proceso":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            En Proceso
          </Badge>
        )
      case "revision":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            En Revisión
          </Badge>
        )
      case "aprobado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Aprobado
          </Badge>
        )
      case "rechazado":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rechazado
          </Badge>
        )
      case "finalizado":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Finalizado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTramites(filteredTramites.map((tramite) => tramite.id))
    } else {
      setSelectedTramites([])
    }
  }

  const handleSelectTramite = (tramiteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTramites((prev) =>
      prev.includes(tramiteId) ? prev.filter((id) => id !== tramiteId) : [...prev, tramiteId],
    )
  }

  const handleTramiteClick = (tramiteId: string) => {
    setSelectedTramiteId(tramiteId)
    setShowDetailPanel(true)
  }

  const closeDetailPanel = () => {
    setShowDetailPanel(false)
    setSelectedTramiteId(null)
  }

  // Filter tramites based on search query and filters
  const filteredTramites = tramites.filter((tramite) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      tramite.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tramite.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tramite.responsable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tramite.solicitante.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by responsable
    const matchesResponsable = filterResponsable === "Todos" || tramite.responsable === filterResponsable

    // Filter by estado
    const matchesEstado = filterEstado === "Todos" || tramite.estado === filterEstado.toLowerCase()

    return matchesSearch && matchesResponsable && matchesEstado
  })

  // Get the selected tramite
  const selectedTramite = selectedTramiteId ? tramites.find((tramite) => tramite.id === selectedTramiteId) : null

  // Get unique responsables for filter dropdown
  const responsables = ["Todos", ...new Set(tramites.map((tramite) => tramite.responsable))]

  // Get unique estados for filter dropdown
  const estados = ["Todos", "Pendiente", "En Proceso", "En Revisión", "Aprobado", "Rechazado", "Finalizado"]

  return (
    <div 
      className="flex flex-1 overflow-hidden w-full max-w-full"
      style={containerStyle}>
      {/* Main Tramite List */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          showDetailPanel ? "md:w-1/2 lg:w-1/2" : "w-full"
        } ${showDetailPanel ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b w-full">
          <div className="flex items-center">
            <span className="font-medium mr-2">Administración</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
            <span className="ml-4 text-blue-600 md:inline hidden">
              {filteredTramites.length} Trámite(s) encontrado(s)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-500 md:flex hidden">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 md:flex hidden">
              <ListIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Advanced Search Panel */}
        <div className="bg-white border-b p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="responsable" className="block text-sm font-medium text-gray-700 mb-1">
                Responsable:
              </label>
              <select
                id="responsable"
                value={filterResponsable}
                onChange={(e) => setFilterResponsable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {responsables.map((resp) => (
                  <option key={resp} value={resp}>
                    {resp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                Código Trámite:
              </label>
              <input
                type="text"
                id="codigo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: 001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado Trámite:
              </label>
              <select
                id="estado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setFilterResponsable("Todos")
                  setFilterEstado("Todos")
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1" size="sm">
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center px-4 py-2 border-b bg-white justify-between w-full">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded"
              checked={selectedTramites.length > 0 && selectedTramites.length === filteredTramites.length}
              onChange={handleSelectAll}
            />
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center ml-4 md:flex hidden">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Filter className="h-4 w-4 mr-1" />
              <span className="text-sm mr-1">Filtrar</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Download className="h-4 w-4 mr-1" />
              <span className="text-sm hidden md:inline">Exportar</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-sm hidden md:inline">Nuevo</span>
            </Button>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tramite List */}
        <div className="flex-1 overflow-auto w-full">
          <div className="border-b">
            <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">Resultados de la Búsqueda</div>
            {filteredTramites.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay trámites que coincidan con los criterios de búsqueda</p>
                </div>
              </div>
            ) : (
              filteredTramites.map((tramite) => (
                <div
                  key={tramite.id}
                  className={`flex items-center px-4 py-2 border-b hover:bg-gray-100 cursor-pointer w-full max-w-full ${
                    selectedTramites.includes(tramite.id) ? "bg-blue-50" : ""
                  } ${selectedTramiteId === tramite.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""}`}
                  onClick={() => handleTramiteClick(tramite.id)}
                >
                  <div className="flex items-center mr-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={selectedTramites.includes(tramite.id)}
                      onChange={(e) => handleSelectTramite(tramite.id, e as unknown as React.MouseEvent)}
                    />
                  </div>
                  <div className="w-[80px] min-w-[80px] text-gray-800 mr-2">{tramite.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="truncate flex-1">
                        <span className={`mr-1 ${selectedTramiteId === tramite.id ? "font-medium" : ""}`}>
                          {tramite.titulo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-[120px] min-w-[120px] truncate text-gray-800 mr-2 md:block hidden">
                    {tramite.responsable}
                  </div>
                  <div className="mx-2 text-gray-600 flex-shrink-0 md:block hidden">
                    {getStatusBadge(tramite.estado)}
                  </div>
                  <div className="w-[100px] lg:w-[120px] text-right text-xs text-gray-500 flex-shrink-0">
                    {tramite.fechaIngreso}
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTramiteClick(tramite.id)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle edit action
                        alert(`Editar trámite ${tramite.id}`)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tramite Detail Panel */}
      {showDetailPanel && selectedTramite && (
        <div className="md:w-1/2 lg:w-1/2 bg-white border-l border-gray-200 h-screen flex-shrink-0 flex flex-col">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={closeDetailPanel} className="md:flex hidden">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <Button variant="ghost" size="sm" onClick={closeDetailPanel} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-gray-600">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1" style={{ height: "calc(100vh - 60px)" }}>
            <div className="p-6 pb-32 max-w-3xl mx-auto">
              {/* Encabezado con título e información general */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{selectedTramite.titulo}</h1>
                  {getStatusBadge(selectedTramite.estado)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Trámite: {selectedTramite.id}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>Solicitante: {selectedTramite.solicitante}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Fecha Ingreso: {selectedTramite.fechaIngreso}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Última actualización: {selectedTramite.ultimaActualizacion}</span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-gray-600 font-medium mb-2">Descripción:</h3>
                <p className="text-gray-800 leading-relaxed">
                  {selectedTramite.descripcion || "No hay descripción para este trámite."}
                </p>
              </div>

              {/* Información de estado */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Estado del Trámite</h2>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center mb-4">
                    {selectedTramite.estado === "pendiente" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    ) : selectedTramite.estado === "aprobado" || selectedTramite.estado === "finalizado" ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : selectedTramite.estado === "rechazado" ? (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <span className="font-medium">Estado actual: {getStatusBadge(selectedTramite.estado)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Responsable:</span> {selectedTramite.responsable}
                    </div>
                    <div>
                      <span className="font-medium">Actualizado:</span> {selectedTramite.ultimaActualizacion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones administrativas */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Acciones Administrativas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Edit className="h-5 w-5 mr-2" />
                    Actualizar Estado
                  </Button>
                  <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    <User className="h-5 w-5 mr-2" />
                    Reasignar Responsable
                  </Button>
                  <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    <Download className="h-5 w-5 mr-2" />
                    Exportar Historial
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Eliminar Trámite
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
