"use client"

import type React from "react"

import { useState } from "react"
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ListIcon,
  LayoutGrid,
  FileText,
  Calendar,
  Clock,
  User,
  Filter,
  X,
  ChevronLeft,
  Download,
  Printer,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TrackingEntry {
  id: string
  status: "iniciado" | "en_proceso" | "revision" | "aprobado" | "rechazado" | "finalizado"
  responsable: string
  fechaIngreso: string
  observaciones: string
  fechaFinalizacion: string
}

interface Tramite {
  id: string
  titulo: string
  solicitante: string
  fechaInicio: string
  ultimoEstado: "iniciado" | "en_proceso" | "revision" | "aprobado" | "rechazado" | "finalizado"
  ultimaActualizacion: string
  entries: TrackingEntry[]
  isSelected?: boolean
}

export function TrackingManagement() {
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

  // Sample tracking data
  const tramites: Tramite[] = [
    {
      id: "001",
      titulo: "Solicitud de Licencia Ambiental",
      solicitante: "Carlos Vera",
      fechaInicio: "01/05/2024",
      ultimoEstado: "en_proceso",
      ultimaActualizacion: "03/05/2024",
      entries: [
        {
          id: "entry-3",
          status: "en_proceso",
          responsable: "Carlos V.",
          fechaIngreso: "03/05/2024",
          observaciones:
            "Pendiente de revisión documental. Se contactará al solicitante para subsanar observaciones menores.",
          fechaFinalizacion: "N/A",
        },
        {
          id: "entry-2",
          status: "iniciado",
          responsable: "Mesa de Partes",
          fechaIngreso: "01/05/2024",
          observaciones: "Trámite recibido y digitalizado. Código asignado: 001.",
          fechaFinalizacion: "N/A",
        },
      ],
    },
    {
      id: "002",
      titulo: "Emisión de Certificado TRM",
      solicitante: "María López",
      fechaInicio: "02/05/2024",
      ultimoEstado: "aprobado",
      ultimaActualizacion: "15/05/2024",
      entries: [
        {
          id: "entry-4",
          status: "aprobado",
          responsable: "Departamento Legal",
          fechaIngreso: "10/05/2024",
          observaciones: "Documentación completa y verificada. Se procede a la emisión del certificado.",
          fechaFinalizacion: "15/05/2024",
        },
        {
          id: "entry-3",
          status: "revision",
          responsable: "Ana M.",
          fechaIngreso: "05/05/2024",
          observaciones: "En revisión por el departamento legal. Pendiente verificación de documentos adjuntos.",
          fechaFinalizacion: "N/A",
        },
        {
          id: "entry-2",
          status: "iniciado",
          responsable: "Mesa de Partes",
          fechaIngreso: "02/05/2024",
          observaciones: "Trámite recibido y digitalizado. Código asignado: 002.",
          fechaFinalizacion: "N/A",
        },
      ],
    },
    {
      id: "003",
      titulo: "Análisis de Propuesta Comercial",
      solicitante: "Empresa ABC S.A.",
      fechaInicio: "03/05/2024",
      ultimoEstado: "finalizado",
      ultimaActualizacion: "20/05/2024",
      entries: [
        {
          id: "entry-5",
          status: "finalizado",
          responsable: "Sistema",
          fechaIngreso: "20/05/2024",
          observaciones: "Trámite finalizado y archivado. Notificación enviada al solicitante.",
          fechaFinalizacion: "20/05/2024",
        },
        {
          id: "entry-4",
          status: "aprobado",
          responsable: "Comité Evaluador",
          fechaIngreso: "18/05/2024",
          observaciones: "Propuesta aprobada por unanimidad. Se procede a la generación de documentos finales.",
          fechaFinalizacion: "18/05/2024",
        },
        {
          id: "entry-3",
          status: "revision",
          responsable: "Departamento Técnico",
          fechaIngreso: "12/05/2024",
          observaciones: "Análisis técnico en curso. Se solicitaron aclaraciones adicionales al cliente.",
          fechaFinalizacion: "N/A",
        },
        {
          id: "entry-2",
          status: "iniciado",
          responsable: "Mesa de Partes",
          fechaIngreso: "03/05/2024",
          observaciones: "Trámite recibido y digitalizado. Código asignado: 003.",
          fechaFinalizacion: "N/A",
        },
      ],
    },
    {
      id: "004",
      titulo: "Actualización Base de Datos Proveedores",
      solicitante: "Departamento de Compras",
      fechaInicio: "05/05/2024",
      ultimoEstado: "en_proceso",
      ultimaActualizacion: "08/05/2024",
      entries: [
        {
          id: "entry-3",
          status: "en_proceso",
          responsable: "Juan P.",
          fechaIngreso: "08/05/2024",
          observaciones: "Verificación de datos de contacto en curso. 60% completado.",
          fechaFinalizacion: "N/A",
        },
        {
          id: "entry-2",
          status: "iniciado",
          responsable: "Mesa de Partes",
          fechaIngreso: "05/05/2024",
          observaciones: "Trámite recibido y asignado. Código asignado: 004.",
          fechaFinalizacion: "N/A",
        },
      ],
    },
    {
      id: "005",
      titulo: "Solicitud de Permiso Ambiental",
      solicitante: "Eduardo Topon",
      fechaInicio: "06/05/2024",
      ultimoEstado: "revision",
      ultimaActualizacion: "12/05/2024",
      entries: [
        {
          id: "entry-3",
          status: "revision",
          responsable: "Comité Ambiental",
          fechaIngreso: "12/05/2024",
          observaciones: "Evaluación de impacto ambiental en curso. Se solicitaron estudios complementarios.",
          fechaFinalizacion: "N/A",
        },
        {
          id: "entry-2",
          status: "iniciado",
          responsable: "Mesa de Partes",
          fechaIngreso: "06/05/2024",
          observaciones: "Documentación recibida y registrada. Código asignado: 005.",
          fechaFinalizacion: "N/A",
        },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "iniciado":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Iniciado
          </Badge>
        )
      case "en_proceso":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
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
      setSelectedTramites(tramites.map((tramite) => tramite.id))
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

  // Filter tramites based on search query
  const filteredTramites = tramites.filter(
    (tramite) =>
      tramite.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tramite.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tramite.solicitante.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get the selected tramite
  const selectedTramite = selectedTramiteId ? tramites.find((tramite) => tramite.id === selectedTramiteId) : null

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
            <span className="font-medium mr-2">Seguimiento</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
            <span className="ml-4 text-blue-600 md:inline hidden">
              {filteredTramites.length} Trámites en seguimiento
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
          <div className="relative flex-1 max-w-md mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar trámites"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
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
            <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">Trámites en Seguimiento</div>
            {filteredTramites.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay trámites que coincidan con la búsqueda</p>
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
                  <div className="w-[180px] min-w-[120px] max-w-[200px] truncate text-gray-800 mr-2 md:block hidden">
                    {tramite.solicitante}
                  </div>
                  <div className="mx-2 text-gray-600 flex-shrink-0 md:block hidden">
                    {getStatusBadge(tramite.ultimoEstado)}
                  </div>
                  <div className="w-[100px] lg:w-[120px] text-right text-xs text-gray-500 flex-shrink-0">
                    {tramite.ultimaActualizacion}
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
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1" style={{ height: "calc(100vh - 60px)" }}>
            <div className="p-6 pb-32 max-w-3xl mx-auto">
              {/* Encabezado con título e información general */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{selectedTramite.titulo}</h1>
                  {getStatusBadge(selectedTramite.ultimoEstado)}
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
                    <span>Inicio: {selectedTramite.fechaInicio}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Última actualización: {selectedTramite.ultimaActualizacion}</span>
                  </div>
                </div>
              </div>

              {/* Historial del trámite */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Historial del Trámite</h2>
                <div className="space-y-4">
                  {selectedTramite.entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border ${
                        index === 0 ? "border-indigo-200 bg-indigo-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          {getStatusBadge(entry.status)}
                          <span className="ml-2 font-medium">{entry.responsable}</span>
                        </div>
                        <span className="text-sm text-gray-500">{entry.fechaIngreso}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{entry.observaciones}</p>
                      {entry.fechaFinalizacion !== "N/A" && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Finalizado:</span> {entry.fechaFinalizacion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 mt-8 pb-8">
                <Button variant="outline" size="lg" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Ver Documentos
                </Button>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Printer className="h-5 w-5 mr-2" />
                  Imprimir Historial
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
