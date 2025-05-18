"use client"

import type React from "react"

import { useState } from "react"
import {
  ChevronDown,
  MoreHorizontal,
  Paperclip,
  Search,
  ListIcon,
  LayoutGrid,
  FileText,
  Check,
  Download,
  FileSignature,
  Trash2,
  FileImage,
  File,
  X,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Types for our task data
interface TaskDocument {
  id: string
  name: string
  url: string
  type: string
}

interface TaskDetails {
  numeroTramite: string
  fechaIngreso: string
  solicitante: string
  descripcion: string
  documentos: TaskDocument[]
  asignadoA: string
  puedeFirmar: boolean
  fechaVencimiento: string
}

interface Task {
  id: string
  title: string
  status: "pendiente" | "en progreso" | "completada"
  priority: "alta" | "media" | "baja" | "no definida"
  details: TaskDetails
  isSelected?: boolean
}

export function TaskManagement() {
  // Sample task data (simulating a backend or data source)
  const initialTasks: Task[] = [
    {
      id: "TRIM-001",
      title: "Recibir Informe IPRUS",
      status: "pendiente",
      priority: "no definida",
      details: {
        numeroTramite: "001",
        fechaIngreso: "01/05/2024",
        solicitante: "Carlos Vera",
        descripcion:
          "Recepción y verificación del informe IPRUS para el trámite de licencia ambiental. Asegurar que todos los anexos estén completos.",
        documentos: [
          { id: "doc1", name: "informe_iprus_main.pdf", url: "#", type: "pdf" },
          { id: "doc2", name: "anexo_calculos.xlsx", url: "#", type: "excel" },
          { id: "doc3", name: "mapa_ubicacion.jpg", url: "#", type: "image" },
        ],
        asignadoA: "Andrea G.",
        puedeFirmar: true,
        fechaVencimiento: "15/05/2024",
      },
    },
    {
      id: "TRM-002",
      title: "Emitir Certificado TRM",
      status: "pendiente",
      priority: "media",
      details: {
        numeroTramite: "002",
        fechaIngreso: "02/05/2024",
        solicitante: "Maria Lopez",
        descripcion: "Generar y emitir el certificado TRM una vez validados los requisitos. Notificar al solicitante.",
        documentos: [
          { id: "doc4", name: "solicitud_certificado.pdf", url: "#", type: "pdf" },
          { id: "doc5", name: "comprobante_pago.docx", url: "#", type: "word" },
        ],
        asignadoA: "Andrea G.",
        puedeFirmar: false,
        fechaVencimiento: "20/05/2024",
      },
    },
    {
      id: "TRM-003",
      title: "Revisar Propuesta Cliente X",
      status: "en progreso",
      priority: "alta",
      details: {
        numeroTramite: "003",
        fechaIngreso: "03/05/2024",
        solicitante: "Empresa ABC S.A.",
        descripcion:
          "Análisis detallado de la propuesta comercial enviada por el Cliente X. Preparar contrapropuesta si es necesario.",
        documentos: [
          { id: "doc6", name: "propuesta_cliente_v1.2.pdf", url: "#", type: "pdf" },
          { id: "doc7", name: "NDA_firmado_clienteX.pdf", url: "#", type: "pdf" },
        ],
        asignadoA: "Andrea G.",
        puedeFirmar: true,
        fechaVencimiento: "10/05/2024",
      },
    },
    {
      id: "TRM-004",
      title: "Actualizar Base de Datos Proveedores",
      status: "pendiente",
      priority: "baja",
      details: {
        numeroTramite: "004",
        fechaIngreso: "05/05/2024",
        solicitante: "Departamento de Compras",
        descripcion: "Ingresar nuevos proveedores y actualizar información de contacto de los existentes.",
        documentos: [{ id: "doc8", name: "listado_nuevos_prov.csv", url: "#", type: "csv" }],
        asignadoA: "Andrea G.",
        puedeFirmar: false,
        fechaVencimiento: "30/05/2024",
      },
    },
    {
      id: "TRM-005",
      title: "Revisar Solicitud de Permiso Ambiental",
      status: "pendiente",
      priority: "alta",
      details: {
        numeroTramite: "005",
        fechaIngreso: "06/05/2024",
        solicitante: "Eduardo Topon",
        descripcion: "Revisión de documentación para solicitud de permiso ambiental para proyecto minero.",
        documentos: [
          { id: "doc9", name: "solicitud_permiso.pdf", url: "#", type: "pdf" },
          { id: "doc10", name: "estudio_impacto.pdf", url: "#", type: "pdf" },
        ],
        asignadoA: "Monica Gallardo",
        puedeFirmar: true,
        fechaVencimiento: "20/05/2024",
      },
    },
    {
      id: "TRM-006",
      title: "Procesar Reporte de Inconsistencias",
      status: "en progreso",
      priority: "media",
      details: {
        numeroTramite: "006",
        fechaIngreso: "07/05/2024",
        solicitante: "Eduardo Topon",
        descripcion: "Análisis y corrección de inconsistencias reportadas en el sistema global.",
        documentos: [{ id: "doc11", name: "reporte_inconsistencias.xlsx", url: "#", type: "excel" }],
        asignadoA: "Monica Gallardo",
        puedeFirmar: false,
        fechaVencimiento: "25/05/2024",
      },
    },
    {
      id: "TRM-007",
      title: "Auditoría de Colindantes",
      status: "pendiente",
      priority: "baja",
      details: {
        numeroTramite: "007",
        fechaIngreso: "08/05/2024",
        solicitante: "Dany Alexander Salazar",
        descripcion: "Realizar auditoría de colindantes para actualización catastral.",
        documentos: [{ id: "doc12", name: "listado_colindantes.pdf", url: "#", type: "pdf" }],
        asignadoA: "Edisson Chiza",
        puedeFirmar: true,
        fechaVencimiento: "30/05/2024",
      },
    },
    {
      id: "TRM-008",
      title: "Reporte Alfanumérico Catastro",
      status: "completada",
      priority: "media",
      details: {
        numeroTramite: "008",
        fechaIngreso: "01/05/2024",
        solicitante: "Dany Alexander Salazar",
        descripcion: "Generación de reporte alfanumérico para actualización de catastro.",
        documentos: [{ id: "doc13", name: "reporte_catastro.pdf", url: "#", type: "pdf" }],
        asignadoA: "Edisson Chiza",
        puedeFirmar: false,
        fechaVencimiento: "10/05/2024",
      },
    },
  ]

  const [tasks, setTasks] = useState<Task[]>([...initialTasks])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { toast } = useToast()
  const [showCompleted, setShowCompleted] = useState(false)
  const [showDetailPanel, setShowDetailPanel] = useState(false)

  // Utility Functions
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Alta
          </Badge>
        )
      case "media":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Media
          </Badge>
        )
      case "baja":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Baja
          </Badge>
        )
      default:
        return <span className="text-gray-700">No Definida</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pendiente
          </Badge>
        )
      case "en progreso":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            En Progreso
          </Badge>
        )
      case "completada":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "word":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "excel":
      case "xlsx":
      case "csv":
        return <FileText className="h-4 w-4 text-green-500" />
      case "image":
      case "jpg":
      case "png":
        return <FileImage className="h-4 w-4 text-purple-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    } else {
      setSelectedTasks([])
    }
  }

  const handleSelectTask = (taskId: string, e: React.MouseEvent) => {
    // Prevent propagation to avoid opening detail panel when clicking checkbox
    e.stopPropagation()
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setShowDetailPanel(true)
  }

  const completeTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status: "completada" as const } : task)),
    )

    toast({
      title: "Tarea completada",
      description: `La tarea ha sido marcada como completada.`,
    })

    // Si la tarea completada es la que se está mostrando, cerrar el panel de detalles
    if (taskId === selectedTaskId) {
      setShowDetailPanel(false)
      setSelectedTaskId(null)
    }
  }

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`)) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
        setShowDetailPanel(false)
      }

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente.",
      })
    }
  }

  const handleSignDocument = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      toast({
        title: "Firma de documentos",
        description: `Funcionalidad "Firmar Documentos" para ${task.title} (simulado).`,
      })
    }
  }

  const closeDetailPanel = () => {
    setShowDetailPanel(false)
    setSelectedTaskId(null)
  }

  // Filter tasks based on showCompleted state
  const filteredTasks = tasks.filter((task) => showCompleted || task.status !== "completada")

  // Get the selected task
  const selectedTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) : null

  return (
    <div className="flex flex-1 overflow-hidden w-full max-w-full">
      {/* Main Task List */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          showDetailPanel ? "md:w-1/2 lg:w-1/2" : "w-full"
        } ${showDetailPanel ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b w-full">
          <div className="flex items-center">
            <span className="font-medium mr-2">Tareas</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
            <span className="ml-4 text-blue-600 md:inline hidden">
              {filteredTasks.filter((t) => t.status !== "completada").length} Tareas pendientes
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 md:flex hidden"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Ocultar completadas" : "Mostrar completadas"}
            </Button>
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
              checked={selectedTasks.length > 0 && selectedTasks.length === filteredTasks.length}
              onChange={handleSelectAll}
            />
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center ml-4 md:flex hidden">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <span className="text-sm mr-1">Filtrar</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center ml-2 lg:flex hidden">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Paperclip className="h-4 w-4 mr-1" />
              <span className="text-sm">Adjuntos</span>
            </Button>
          </div>
          <div className="relative flex-1 max-w-md mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar tareas"
              className="pl-10 pr-4 py-1 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto w-full">
          <div className="border-b">
            <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">Tareas Activas</div>
            {filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay tareas para mostrar</p>
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center px-4 py-2 border-b hover:bg-gray-100 cursor-pointer w-full max-w-full ${
                    selectedTasks.includes(task.id) ? "bg-blue-50" : ""
                  } ${task.status === "completada" ? "opacity-70" : ""} ${
                    selectedTaskId === task.id ? "bg-indigo-50 border-l-4 border-l-indigo-500" : ""
                  }`}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <div className="flex items-center mr-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => handleSelectTask(task.id, e as unknown as React.MouseEvent)}
                    />
                  </div>
                  <div className="w-[80px] min-w-[80px] text-gray-800 mr-2">{task.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="truncate flex-1">
                        <span className={`mr-1 ${selectedTaskId === task.id ? "font-medium" : ""}`}>{task.title}</span>
                        <span className="text-gray-500 font-normal hidden md:inline">
                          - {task.details.descripcion.substring(0, 60)}
                          {task.details.descripcion.length > 60 ? "..." : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-[180px] min-w-[120px] max-w-[200px] truncate text-gray-800 mr-2 md:block hidden">
                    {task.details.solicitante}
                  </div>
                  <div className="w-[120px] min-w-[120px] truncate text-gray-800 mr-2 md:block hidden">
                    {task.details.asignadoA}
                  </div>
                  <div className="mx-2 text-gray-600 flex-shrink-0 md:block hidden">
                    {getPriorityBadge(task.priority)}
                  </div>
                  <div className="w-[100px] lg:w-[120px] text-right text-xs text-gray-500 flex-shrink-0">
                    {task.details.fechaVencimiento}
                  </div>
                  <div className="w-[100px] text-right flex-shrink-0 ml-2">{getStatusBadge(task.status)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      {showDetailPanel && selectedTask && (
        <div className="md:w-1/2 lg:w-1/2 bg-white border-l border-gray-200 h-screen flex-shrink-0 flex flex-col">
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={closeDetailPanel} className="md:flex hidden">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
            <Button variant="ghost" size="sm" onClick={closeDetailPanel} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto flex-1" style={{ height: "calc(100vh - 60px)" }}>
            <div className="p-6 pb-32 max-w-3xl mx-auto">
              {/* Encabezado con título y botón de completar */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h1>
                  <p className="text-gray-600 mt-1">ID Trámite: {selectedTask.details.numeroTramite}</p>
                </div>
                {selectedTask.status !== "completada" && (
                  <Button
                    onClick={() => completeTask(selectedTask.id)}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Completar Tarea
                  </Button>
                )}
              </div>

              {/* Información principal en dos columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-gray-600 font-medium mb-1">Solicitante:</h3>
                    <p className="text-gray-800 text-lg">{selectedTask.details.solicitante}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-600 font-medium mb-1">Estado:</h3>
                    <div>
                      {selectedTask.status === "pendiente" ? (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          Pendiente
                        </span>
                      ) : selectedTask.status === "en progreso" ? (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          En Progreso
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Completada
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-600 font-medium mb-1">Fecha de Vencimiento:</h3>
                    <p
                      className={`text-lg ${
                        new Date(selectedTask.details.fechaVencimiento.split("/").reverse().join("-")) < new Date() &&
                        selectedTask.status !== "completada"
                          ? "text-red-600 font-medium"
                          : "text-gray-800"
                      }`}
                    >
                      {selectedTask.details.fechaVencimiento}
                      {new Date(selectedTask.details.fechaVencimiento.split("/").reverse().join("-")) < new Date() &&
                        selectedTask.status !== "completada" && <span className="ml-2">(Vencida)</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-6">
                    <h3 className="text-gray-600 font-medium mb-1">Fecha de Ingreso:</h3>
                    <p className="text-gray-800 text-lg">{selectedTask.details.fechaIngreso}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-gray-600 font-medium mb-1">Prioridad:</h3>
                    <p className="text-gray-800 text-lg">
                      {selectedTask.priority === "alta"
                        ? "Alta"
                        : selectedTask.priority === "media"
                          ? "Media"
                          : selectedTask.priority === "baja"
                            ? "Baja"
                            : "No Definida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-gray-600 font-medium mb-2">Descripción:</h3>
                <p className="text-gray-800 leading-relaxed">
                  {selectedTask.details.descripcion || "No hay descripción para esta tarea."}
                </p>
              </div>

              {/* Documentos Adjuntos */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Documentos Adjuntos</h2>
                {selectedTask.details.documentos && selectedTask.details.documentos.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTask.details.documentos.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150"
                      >
                        <div className="flex items-center">
                          {getFileIcon(doc.type)}
                          <span className="text-gray-700 ml-3">{doc.name}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay documentos adjuntos.</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 mt-8 pb-8">
                <Button variant="outline" size="lg" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <Paperclip className="h-5 w-5 mr-2" />
                  Adjuntar Documento
                </Button>

                {selectedTask.details.puedeFirmar && selectedTask.status !== "completada" && (
                  <Button
                    size="lg"
                    onClick={() => handleSignDocument(selectedTask.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <FileSignature className="h-5 w-5 mr-2" />
                    Firmar Documentos
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => deleteTask(selectedTask.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Eliminar Tarea
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
