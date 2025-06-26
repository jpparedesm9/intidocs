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
  // Establecer estilo para garantizar interactividad
  const containerStyle = {
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
    height: '100%',
    width: '100%',
    zIndex: 10,
    overflow: 'auto'
  };
  // Sample task data (simulating a backend or data source)
  const initialTasks: Task[] = [
    {
      id: "TRIM-001",
      title: "Realizar la revisión de los documentos y verificar que cumplan con todos los requisitos",
      status: "pendiente",
      priority: "media",
      details: {
        numeroTramite: "001",
        fechaIngreso: "01/05/2024",
        solicitante: "Carlos Vera",
        descripcion:
          "Realizar la revisión de los documentos y verificar que cumplan con todos los requisitos. Incluye verificación de firmas, sellos y anexos correspondientes.",
        documentos: [
          { id: "doc1", name: "informe_principal.pdf", url: "#", type: "pdf" },
          { id: "doc2", name: "anexos_tecnicos.xlsx", url: "#", type: "excel" },
          { id: "doc3", name: "planos_referencia.jpg", url: "#", type: "image" },
        ],
        asignadoA: "Andrea G.",
        puedeFirmar: true,
        fechaVencimiento: "15/05/2024",
      },
    }
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
    <div 
      className="flex flex-1 overflow-hidden w-full max-w-full"
      style={containerStyle}>
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
              {/* Encabezado con título y botón de Empezar */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Detalle del trámite</h1>
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md px-6"
                >
                  Empezar
                </Button>
              </div>

              {/* Sección: Propietario */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full h-4 w-4 mr-2"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Propietario</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Número de Identificación</h3>
                    <p className="text-gray-800">1723345566</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
                    <p className="text-gray-800">juan.paredes@email.com</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nombres</h3>
                    <p className="text-gray-800">Juan Pablo</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Apellidos</h3>
                    <p className="text-gray-800">Paredes Muñoz</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                    <p className="text-gray-800">+593 99 123 4567</p>
                  </div>
                </div>

                {/* Subsección: Escritura */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Escritura</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha de inscripción de escritura</h3>
                      <p className="text-gray-800">12/05/2023</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Solicitud para venta</h3>
                      <p className="text-gray-800">Sí</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección: Predio */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 rounded-full h-4 w-4 mr-2"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Predio</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Clave Catastral</h3>
                    <p className="text-gray-800">010-123-456-789</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Número de Predio</h3>
                    <p className="text-gray-800">56879</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Calles</h3>
                    <p className="text-gray-800">Av. 10 de Agosto y Jorge Washington</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Barrio/Sector</h3>
                    <p className="text-gray-800">La Mariscal</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Parroquia</h3>
                    <p className="text-gray-800">Quito Central</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Número de lote</h3>
                    <p className="text-gray-800">L-45</p>
                  </div>
                </div>
              </div>

              {/* Sección: Analista */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500 rounded-full h-4 w-4 mr-2"></div>
                  <h2 className="text-xl font-semibold text-gray-800">Analista</h2>
                </div>
                
                <div className="mt-2">
                  <h3 className="text-base font-medium text-gray-700 mb-3">Cumple con los requisitos:</h3>
                  
                  <div className="flex items-center gap-8 ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="requirements" className="h-5 w-5 text-blue-600" />
                      <span className="ml-2 text-gray-800">Sí</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="requirements" className="h-5 w-5 text-blue-600" />
                      <span className="ml-2 text-gray-800">No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Descargar PDF
                </Button>

                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Enviar a revisión
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
