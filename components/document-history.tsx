"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  Send,
  Edit,
  Eye,
  Filter,
  Search,
  X,
  AlertCircle,
  Archive,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for document history
const mockDocumentHistory = [
  {
    id: "e1",
    timestamp: "2023-10-26T10:00:00Z",
    type: "Creación",
    user: "Juan Pérez",
    status_change: "Borrador",
    details: "Documento inicial creado por el usuario.",
    document_version: "1.0",
    comments: "",
  },
  {
    id: "e2",
    timestamp: "2023-10-26T10:15:30Z",
    type: "Modificación",
    user: "Juan Pérez",
    status_change: "Borrador",
    details: "Se añadió el contenido principal y se adjuntaron anexos.",
    document_version: "1.1",
    comments: "",
  },
  {
    id: "e3",
    timestamp: "2023-10-26T11:05:10Z",
    type: "Envío",
    user: "Juan Pérez",
    status_change: "En Revisión",
    details: "Documento enviado a revisión por el equipo de calidad.",
    document_version: "1.1",
    comments: "Se requiere revisión urgente.",
  },
  {
    id: "e4",
    timestamp: "2023-10-27T09:30:00Z",
    type: "Revisión",
    user: "María López",
    status_change: "En Revisión",
    details: "Revisión inicial completada. Se encontraron observaciones menores.",
    document_version: "1.1",
    comments: "Faltan algunas referencias bibliográficas.",
  },
  {
    id: "e5",
    timestamp: "2023-10-27T14:00:00Z",
    type: "Modificación",
    user: "Juan Pérez",
    status_change: "En Revisión",
    details: "Se corrigieron las observaciones de la revisión.",
    document_version: "1.2",
    comments: "",
  },
  {
    id: "e6",
    timestamp: "2023-10-28T08:45:00Z",
    type: "Aprobación",
    user: "Carlos García",
    status_change: "Aprobado",
    details: "Documento aprobado por la gerencia.",
    document_version: "1.2",
    comments: "Listo para publicación.",
  },
  {
    id: "e7",
    timestamp: "2023-10-28T09:00:00Z",
    type: "Publicación",
    user: "Sistema",
    status_change: "Publicado",
    details: "Documento publicado en el portal interno.",
    document_version: "1.2",
    comments: "",
  },
  {
    id: "e8",
    timestamp: "2023-11-15T16:20:00Z",
    type: "Comentario",
    user: "Ana Rodríguez",
    status_change: "Publicado",
    details: "Comentario añadido al documento.",
    document_version: "1.2",
    comments: "Este documento es muy útil, ¡gracias!",
  },
  {
    id: "e9",
    timestamp: "2024-01-10T09:00:00Z",
    type: "Actualización",
    user: "Juan Pérez",
    status_change: "En Revisión",
    details: "Inicio de proceso de actualización anual del documento.",
    document_version: "2.0 (Borrador)",
    comments: "Se revisarán políticas y procedimientos.",
  },
  {
    id: "e10",
    timestamp: "2024-01-20T10:00:00Z",
    type: "Aprobación",
    user: "Carlos García",
    status_change: "Aprobado",
    details: "Nueva versión del documento aprobada.",
    document_version: "2.0",
    comments: "Versión 2.0 aprobada y lista para publicación.",
  },
]

// Helper function to get icon based on event type
const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "Creación":
      return <FileText className="w-5 h-5 text-blue-600" />
    case "Modificación":
      return <Edit className="w-5 h-5 text-yellow-600" />
    case "Envío":
      return <Send className="w-5 h-5 text-purple-600" />
    case "Revisión":
      return <Eye className="w-5 h-5 text-indigo-600" />
    case "Aprobación":
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case "Publicación":
      return <FileText className="w-5 h-5 text-teal-600" />
    case "Comentario":
      return <MessageSquare className="w-5 h-5 text-gray-600" />
    case "Actualización":
      return <Edit className="w-5 h-5 text-orange-600" />
    case "Archivado":
      return <Archive className="w-5 h-5 text-gray-600" />
    case "Eliminado":
      return <Trash2 className="w-5 h-5 text-red-600" />
    default:
      return <FileText className="w-5 h-5 text-gray-400" />
  }
}

// Helper function to get status badge color
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Borrador":
      return "bg-gray-100 text-gray-800"
    case "En Revisión":
      return "bg-yellow-100 text-yellow-800"
    case "Aprobado":
      return "bg-green-100 text-green-800"
    case "Publicado":
      return "bg-blue-100 text-blue-800"
    case "Rechazado":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

interface HistoryEvent {
  id: string
  timestamp: string
  type: string
  user: string
  status_change: string
  details: string
  document_version: string
  comments: string
}

export function DocumentHistory() {
  const [history] = useState<HistoryEvent[]>(mockDocumentHistory)
  const [filteredHistory, setFilteredHistory] = useState<HistoryEvent[]>(mockDocumentHistory)
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Apply filters and search
  useEffect(() => {
    let currentFiltered = history

    if (filterType) {
      currentFiltered = currentFiltered.filter((event) => event.type === filterType)
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      currentFiltered = currentFiltered.filter(
        (event) =>
          event.user.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.type.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.details.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.comments.toLowerCase().includes(lowerCaseSearchTerm) ||
          event.status_change.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }

    // Sort by timestamp descending (most recent first)
    currentFiltered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setFilteredHistory(currentFiltered)
  }, [searchTerm, filterType, history])

  // Extract unique event types for filter dropdown
  const uniqueEventTypes = [...new Set(history.map((event) => event.type))]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Historial del Documento</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>
                <strong>ID:</strong> DOC-2023-001
              </span>
              <span>
                <strong>Asunto:</strong> Propuesta de Proyecto de Innovación Tecnológica
              </span>
              <Badge className={getStatusBadgeColor("Publicado")}>Publicado</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Opciones de Filtro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Buscar en historial</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar eventos, usuarios, comentarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Evento</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {uniqueEventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("")
                  }}
                >
                  Limpiar filtros
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  Ocultar filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Timeline Section */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
                <span className="text-sm text-gray-500">
                  {filteredHistory.length} evento{filteredHistory.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No se encontraron eventos que coincidan con los criterios de búsqueda.
                  </p>
                </Card>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {filteredHistory.map((event, index) => (
                      <div
                        key={event.id}
                        className={`relative flex items-start gap-4 cursor-pointer group ${
                          selectedEvent?.id === event.id ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"
                        } p-4 rounded-lg transition-all duration-200`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                          {getEventTypeIcon(event.type)}
                        </div>

                        {/* Event content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.type}</h3>
                            <Badge className={getStatusBadgeColor(event.status_change)}>{event.status_change}</Badge>
                          </div>

                          <p className="text-gray-700 mb-3">{event.details}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{event.user}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(event.timestamp).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(event.timestamp).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            {event.document_version && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>v{event.document_version}</span>
                              </div>
                            )}
                          </div>

                          {event.comments && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-1 mb-1">
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Comentario:</span>
                              </div>
                              <p className="text-sm text-gray-600">{event.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Details Sidebar */}
          {selectedEvent && (
            <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Detalles del Evento</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(selectedEvent.type)}
                        <span className="font-medium">{selectedEvent.type}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Usuario:</span>
                          <span>{selectedEvent.user}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Fecha:</span>
                          <span>
                            {new Date(selectedEvent.timestamp).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Hora:</span>
                          <span>
                            {new Date(selectedEvent.timestamp).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Estado:</span>
                          <Badge className={getStatusBadgeColor(selectedEvent.status_change)}>
                            {selectedEvent.status_change}
                          </Badge>
                        </div>

                        {selectedEvent.document_version && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Versión:</span>
                            <span>{selectedEvent.document_version}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Descripción
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedEvent.details}</p>
                    </CardContent>
                  </Card>

                  {selectedEvent.comments && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Comentarios
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{selectedEvent.comments}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
