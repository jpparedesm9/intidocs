"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
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
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { IprusReportDialog } from "./iprus-report-dialog"
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react"

// Tipo para la respuesta del API de detalle de trámite
interface TramiteResponse {
  exito: boolean;
  mensaje: string;
  data: {
    tramite: {
      trmId: number;
      preId: number;
      proId: number;
      tipo: string;
      estado: string;
      fechaInicio: string;
      fechaModificacion: string;
      fechaFinalizacion: string | null;
      valor: number;
      observaciones: string;
      fechaDePago: string;
      reciboPago: string | null;
    };
    documentos: {
      docId: number;
      nombreOriginal: string;
      referenceId: string;
      fechaSubida: string;
    }[];
    seguimientos: any[];
    propietario: {
      nombres: string;
      apellidos: string;
      correo: string | null;
      numeroIdentificacion: string;
      telefonoUno: string;
    };
    predio: {
      claveCatastral: string;
      numeroPredio: string;
      calles: string;
      nombreBarrio: string;
      numeroLote: string;
      nombreParroquia: string;
      idParroquia: number;
    };
    taskId: string;
    nombreTareaActual: string;
    estadoProceso: string;
    datosEspecificos: {
      tipoSolicitud: string | null;
      fechaInscripcion: string;
    };
  };
}

// Tipo para la respuesta del API de tareas pendientes
interface TareasPendientesResponse {
  exito: boolean;
  mensaje: string;
  data: TareaPendiente[];
}

// Tipo para una tarea pendiente individual
interface TareaPendiente {
  tramite: {
    trmId: number;
    preId: number;
    proId: number;
    tipo: string;
    estado: string;
    fechaInicio: string;
    fechaModificacion: string;
    fechaFinalizacion: string | null;
    valor: number;
    observaciones: string;
    fechaDePago: string;
    reciboPago: string | null;
  };
  documentos: {
    docId: number;
    nombreOriginal: string;
    referenceId: string;
    fechaSubida: string;
  }[];
  seguimientos: {
    segId: number;
    responsable: string;
    fechaIngreso: string;
    fechaFinalizacion: string | null;
    estadoTramite: string;
    observaciones: string;
  }[];
  propietario: {
    nombres: string;
    apellidos: string;
    correo: string | null;
    numeroIdentificacion: string;
    telefonoUno: string;
  };
  predio: {
    claveCatastral: string;
    numeroPredio: string;
    calles: string;
    nombreBarrio: string;
    numeroLote: string;
    nombreParroquia: string;
    idParroquia: number;
  };
  taskId: string;
  nombreTareaActual: string;
  estadoProceso: string;
  datosEspecificos: {
    tipoSolicitud: string | null;
    fechaInscripcion: string;
  };
}

// Datos de ejemplo del trámite
const tramiteDataMock: TramiteResponse = {
  "exito": true,
  "mensaje": "Detalle del trámite obtenido correctamente.",
  "data": {
    "tramite": {
      "trmId": 233,
      "preId": 1,
      "proId": 2,
      "tipo": "TPRUS",
      "estado": "PAGADO",
      "fechaInicio": "2025-07-01T19:54:55.155+00:00",
      "fechaModificacion": "2025-07-01T19:56:18.914+00:00",
      "fechaFinalizacion": null,
      "valor": 285.34,
      "observaciones": "Pago confirmado",
      "fechaDePago": "2025-07-01T19:56:18.914+00:00",
      "reciboPago": null
    },
    "documentos": [
      {
        "docId": 104,
        "nombreOriginal": "Profile (4).pdf",
        "referenceId": "f12ccdb04-536f-4879-845f-d84efb5b3a1a",
        "fechaSubida": "2025-07-01T14:54:55.44"
      }
    ],
    "seguimientos": [],
    "propietario": {
      "nombres": "JULIO ROSENDO",
      "apellidos": "MATUTE CASTRO",
      "correo": null,
      "numeroIdentificacion": "0100055375",
      "telefonoUno": "0"
    },
    "predio": {
      "claveCatastral": "170350010121000100",
      "numeroPredio": "LOTE 1",
      "calles": "S/N",
      "nombreBarrio": "LA UNION",
      "numeroLote": "LOTE 1",
      "nombreParroquia": "CUTUGLAGUA",
      "idParroquia": 824
    },
    "taskId": "74447cb3-56b5-11f0-b7bf-025041000001",
    "nombreTareaActual": "2.Realizar la revisión de los documentos y verificar que cumplan con todos los requisitos",
    "estadoProceso": "PAGADO",
    "datosEspecificos": {
      "tipoSolicitud": "Venta",
      "fechaInscripcion": "2023-10-01"
    }
  }
};

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

export function TaskManagement(): JSX.Element {
  // Establecer estilo para garantizar interactividad
  const containerStyle = {
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
    height: '100%',
    width: '100%',
    zIndex: 10,
    overflow: 'auto'
  };
  
  // Obtener el token de autenticación
  const { token } = useAuth();
  
  // Estado para almacenar los datos del trámite
  const [tramiteData, setTramiteData] = useState<TramiteResponse | null>(null);
  const [tareasPendientes, setTareasPendientes] = useState<TareaPendiente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaPendiente | null>(null);

  // Función para cargar las tareas pendientes desde la API
  const fetchTareasPendientes = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Use username from authentication if available or fall back to default
      const username = 'varobles'; // In a real app, get this from user context
      
      // Log API request
      console.log(`Fetching tasks for user: ${username}`);
      
      try {
        // Hacer la llamada al API
        const response = await fetch(`http://localhost:8082/api/tramites/tasks/pendientes?username=${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Add timeout for better UX
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
          // More detailed error handling based on status codes
          if (response.status === 401 || response.status === 403) {
            throw new Error('No tiene permiso para acceder a estas tareas. Por favor inicie sesión nuevamente.');
          } else if (response.status === 404) {
            throw new Error('El servicio de tareas no está disponible en este momento.');
          } else if (response.status >= 500) {
            throw new Error(`Error interno del servidor: ${response.status} ${response.statusText}`);
          } else {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
          }
        }
        
        // Parse response data
        const data: TareasPendientesResponse = await response.json();
        
        if (data.exito && data.data) {
          console.log(`Successfully loaded ${data.data.length} tasks`);
          setTareasPendientes(data.data);
          
          // Si hay al menos una tarea pendiente, seleccionarla para mostrar sus detalles
          if (data.data.length > 0) {
            setTareaSeleccionada(data.data[0]);
            // Cargar el detalle del trámite para el primer elemento
            fetchTramiteDetalle(data.data[0].tramite.trmId);
          } else {
            // Clear any selected task if no tasks are returned
            setTareaSeleccionada(null);
            setTramiteData(null);
            // Show toast for empty tasks
            toast({
              title: "No hay tareas pendientes",
              description: "No se encontraron tareas pendientes para este usuario",
              variant: "default"
            });
          }
        } else {
          // Handle API logical errors (when response is ok but success flag is false)
          console.warn('La respuesta no contiene datos o indica error:', data);
          setTareasPendientes([]);
          setTareaSeleccionada(null);
          setTramiteData(null);
          
          // If API returned an error message, use it
          if (!data.exito && data.mensaje) {
            throw new Error(data.mensaje);
          }
        }
      } catch (error) {
        // Enhanced error handling
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('No se pudo conectar al servidor. Verifique su conexión a internet.');
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('La petición ha excedido el tiempo límite. Intente nuevamente.');
        } else {
          throw error; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error('Error al cargar tareas pendientes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar las tareas';
      setLoadError(errorMessage);
      
      // Show toast with error
      toast({
        title: "Error al cargar tareas",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para cargar el detalle de un trámite específico
  const fetchTramiteDetalle = async (tramiteId: number) => {
    // Validate input
    if (!tramiteId) {
      console.error('Invalid tramiteId:', tramiteId);
      setLoadError('ID de trámite inválido');
      return;
    }
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      console.log(`Obteniendo detalle del trámite #${tramiteId}`);
      
      try {
        // Hacer la llamada al API de detalle con timeout
        const response = await fetch(`http://localhost:8082/api/tramites/${tramiteId}/detalle`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Add timeout for better UX
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
          // More detailed error handling based on status codes
          if (response.status === 401 || response.status === 403) {
            throw new Error('No tiene permiso para acceder a este trámite. Por favor inicie sesión nuevamente.');
          } else if (response.status === 404) {
            throw new Error(`El trámite #${tramiteId} no existe o no está disponible.`);
          } else if (response.status >= 500) {
            throw new Error(`Error interno del servidor: ${response.status} ${response.statusText}`);
          } else {
            throw new Error(`Error al obtener detalle: ${response.status} ${response.statusText}`);
          }
        }
        
        // Parse response safely
        let data: TramiteResponse;
        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error('La respuesta del servidor no es un JSON válido');
        }
        
        if (data.exito && data.data) {
          console.log(`Detalle del trámite #${tramiteId} cargado con éxito`);
          setTramiteData(data);
          
          // Show toast for SIN_TAREA_ACTIVA to make it more visible
          if (data.data.estadoProceso === "SIN_TAREA_ACTIVA") {
            toast({
              title: "Trámite sin tarea activa",
              description: "Este trámite no tiene una tarea activa asignada actualmente",
              variant: "warning"
            });
          }
        } else {
          console.warn(`No se pudo obtener el detalle del trámite #${tramiteId}:`, data);
          setTramiteData(null);
          
          // If API returned an error message, use it
          if (!data.exito && data.mensaje) {
            throw new Error(data.mensaje);
          } else {
            throw new Error(`No se pudo obtener el detalle del trámite #${tramiteId}`);
          }
        }
      } catch (error) {
        // Enhanced error handling
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('No se pudo conectar al servidor. Verifique su conexión a internet.');
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('La petición ha excedido el tiempo límite. Intente nuevamente.');
        } else {
          throw error; // Re-throw to be caught by the outer catch
        }
      }
    } catch (error) {
      console.error(`Error al cargar detalle del trámite #${tramiteId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el detalle del trámite';
      setLoadError(errorMessage);
      setTramiteData(null);
      
      // Show toast with error
      toast({
        title: "Error al cargar detalle",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar tareas pendientes al montar el componente
  useEffect(() => {
    if (token) {
      fetchTareasPendientes();
    }
  }, [token]);

  // Convertir las tareas pendientes al formato de Task para la interfaz
  const mapTareasToTasks = (tareas: TareaPendiente[]): Task[] => {
    return tareas.map(tarea => ({
      id: tarea.tramite?.trmId?.toString() || 'sin-id',
      title: tarea.nombreTareaActual || 'Sin título',
      status: "pendiente",
      priority: "media",
      details: {
        numeroTramite: tarea.tramite?.trmId?.toString() || 'Sin número',
        fechaIngreso: tarea.tramite?.fechaInicio ? new Date(tarea.tramite.fechaInicio).toLocaleDateString() : 'Sin fecha',
        solicitante: `${tarea.propietario?.nombres || 'Sin nombre'} ${tarea.propietario?.apellidos || 'Sin apellido'}`,
        descripcion: tarea.nombreTareaActual || 'Sin descripción',
        documentos: (tarea.documentos || []).map(doc => ({
          id: doc.docId?.toString() || 'sin-id',
          name: doc.nombreOriginal || 'Documento sin nombre',
          url: `#/document/${doc.referenceId || 'sin-referencia'}`,
          type: doc.nombreOriginal?.split('.').pop() || 'pdf'
        })),
        asignadoA: tarea.seguimientos?.[0]?.responsable || "No asignado",
        puedeFirmar: true,
        fechaVencimiento: tarea.tramite?.fechaInicio ? new Date(new Date(tarea.tramite.fechaInicio).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'Sin fecha',
      },
    }));
  };
  
  // Inicializar tareas vacías
  const [tasks, setTasks] = useState<Task[]>([])
  
  // Pagination state (moved here to be available in useEffect)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Filtering state (moved here to be available in useEffect)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  
  // Actualizar las tareas cuando cambian las tareas pendientes
  useEffect(() => {
    const mappedTasks = mapTareasToTasks(tareasPendientes);
    setTasks(mappedTasks);
    
    // Total pages will be calculated dynamically
    
    // Reset to first page when tasks change
    setCurrentPage(1);
  }, [tareasPendientes, itemsPerPage]);
  
  // Update total pages when filters change
  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, searchQuery, showCompleted]);
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    if (!isFilterOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown') && !target.closest('.filter-button')) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { toast } = useToast()
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  // Removed cumpliendoRequisitos state as it's no longer needed
  const [isIprusModalOpen, setIsIprusModalOpen] = useState(false)
  // Removed isTaskStarted state as it's no longer needed
  const [tipoObservaciones, setTipoObservaciones] = useState<'Menores' | 'Mayores' | 'Ninguna' | null>(null)
  
  // Sorting state
  const [sortField, setSortField] = useState<'id' | 'title' | 'solicitante' | 'asignadoA' | 'fechaVencimiento' | 'status' | 'priority'>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Utility Functions
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "alta":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 hover:bg-red-100">
            Alta
          </Badge>
        )
      case "media":
        return (
          <Badge variant="outline" className="bg-brand-yellow/20 text-brand-dark-blue border-brand-yellow hover:bg-brand-yellow/30">
            Media
          </Badge>
        )
      case "baja":
        return (
          <Badge variant="outline" className="bg-brand-green/20 text-brand-green border-brand-green hover:bg-brand-green/30">
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
          <Badge variant="outline" className="bg-brand-yellow/20 text-brand-dark-blue border-brand-yellow hover:bg-brand-yellow/30">
            Pendiente
          </Badge>
        )
      case "en progreso":
        return (
          <Badge variant="outline" className="bg-brand-medium-blue/20 text-brand-medium-blue border-brand-medium-blue hover:bg-brand-medium-blue/30">
            En Progreso
          </Badge>
        )
      case "completada":
        return (
          <Badge variant="outline" className="bg-brand-green/20 text-brand-green border-brand-green hover:bg-brand-green/30">
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
        return <FileText className="h-4 w-4 text-brand-dark-blue" />
      case "excel":
      case "xlsx":
      case "csv":
        return <FileText className="h-4 w-4 text-brand-green" />
      case "image":
      case "jpg":
      case "png":
        return <FileImage className="h-4 w-4 text-brand-medium-blue" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }
  
  // Get appropriate sort icon for a column
  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-brand-green" />
      : <ArrowDown className="h-4 w-4 text-brand-green" />
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTasks(currentTasks.map((task) => task.id))
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
    
    // Buscar la tarea en las tareas pendientes y establecerla como la tarea seleccionada
    const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === taskId);
    if (tarea) {
      setTareaSeleccionada(tarea);
      
      // Obtener el detalle completo del trámite desde la API
      fetchTramiteDetalle(tarea.tramite.trmId);
      
      // Mostramos la vista de detalle mientras se carga
      setShowDetailPanel(true)
    } else {
      console.warn(`No se encontró la tarea con ID ${taskId} en las tareas pendientes`);
      setShowDetailPanel(true)
    }
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

  // Sort function for tasks
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      // Sort based on the selected field
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'solicitante':
          comparison = a.details.solicitante.localeCompare(b.details.solicitante);
          break;
        case 'asignadoA':
          comparison = a.details.asignadoA.localeCompare(b.details.asignadoA);
          break;
        case 'fechaVencimiento':
          // Compare dates
          const dateA = new Date(a.details.fechaVencimiento);
          const dateB = new Date(b.details.fechaVencimiento);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          // Custom priority order: alta (1), media (2), baja (3), no definida (4)
          const priorityOrder = { alta: 1, media: 2, baja: 3, "no definida": 4 };
          const orderA = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
          const orderB = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
          comparison = orderA - orderB;
          break;
        default:
          comparison = 0;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Toggle sort on field click
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Apply all filters to tasks
  const filteredTasks = sortTasks(tasks.filter((task) => {
    // Filter by completion status
    if (!showCompleted && task.status === "completada") {
      return false;
    }
    
    // Filter by status if a status filter is selected
    if (statusFilter && task.status !== statusFilter) {
      return false;
    }
    
    // Filter by priority if a priority filter is selected
    if (priorityFilter && task.priority !== priorityFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.details.descripcion.toLowerCase().includes(query) ||
        task.details.solicitante.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  }));
  
  // Get current page tasks
  const indexOfLastTask = currentPage * itemsPerPage
  const indexOfFirstTask = indexOfLastTask - itemsPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage))
  
  // Change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

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
            <span className="ml-4 text-brand-green font-medium md:inline hidden">
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
              checked={currentTasks.length > 0 && currentTasks.every(task => selectedTasks.includes(task.id))}
              onChange={handleSelectAll}
            />
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center ml-4 md:flex hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-500 filter-button ${isFilterOpen ? 'bg-gray-100' : ''} ${statusFilter || priorityFilter ? 'border-brand-green text-brand-green' : ''}`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="text-sm mr-1">
                {statusFilter || priorityFilter ? 'Filtros activos' : 'Filtrar'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {/* Filter dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-4 z-20 w-[250px] filter-dropdown">
                <div className="space-y-4">
                  {/* Status filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Estado</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status-filter" 
                          className="h-4 w-4 mr-2"
                          checked={statusFilter === null} 
                          onChange={() => setStatusFilter(null)}
                        />
                        <span className="text-sm">Todos</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status-filter" 
                          className="h-4 w-4 mr-2"
                          checked={statusFilter === "pendiente"} 
                          onChange={() => setStatusFilter("pendiente")}
                        />
                        <span className="text-sm">Pendiente</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status-filter" 
                          className="h-4 w-4 mr-2"
                          checked={statusFilter === "en progreso"} 
                          onChange={() => setStatusFilter("en progreso")}
                        />
                        <span className="text-sm">En progreso</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="status-filter" 
                          className="h-4 w-4 mr-2"
                          checked={statusFilter === "completada"} 
                          onChange={() => setStatusFilter("completada")}
                        />
                        <span className="text-sm">Completada</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Priority filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Prioridad</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority-filter" 
                          className="h-4 w-4 mr-2"
                          checked={priorityFilter === null} 
                          onChange={() => setPriorityFilter(null)}
                        />
                        <span className="text-sm">Todas</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority-filter" 
                          className="h-4 w-4 mr-2"
                          checked={priorityFilter === "alta"} 
                          onChange={() => setPriorityFilter("alta")}
                        />
                        <span className="text-sm">Alta</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority-filter" 
                          className="h-4 w-4 mr-2"
                          checked={priorityFilter === "media"} 
                          onChange={() => setPriorityFilter("media")}
                        />
                        <span className="text-sm">Media</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority-filter" 
                          className="h-4 w-4 mr-2"
                          checked={priorityFilter === "baja"} 
                          onChange={() => setPriorityFilter("baja")}
                        />
                        <span className="text-sm">Baja</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Filter actions */}
                  <div className="flex justify-between pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setStatusFilter(null);
                        setPriorityFilter(null);
                        setSearchQuery("");
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-1 w-full border border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green text-sm"
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
            <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">Tareas Activas ({filteredTasks.length})</div>
            {/* Column Headers */}
            <div className="flex items-center px-4 py-2 bg-gray-100 text-xs font-medium text-gray-700 border-y sticky top-0 z-10">
              <div className="flex items-center mr-2 flex-shrink-0 w-4"></div>
              <div 
                className="w-[120px] min-w-[120px] flex items-center cursor-pointer hover:text-brand-green group"
                onClick={() => toggleSort('id')}
              >
                <span className="font-semibold">N° Trámite</span>
                {getSortIcon('id')}
              </div>
              <div 
                className="flex-1 min-w-0 cursor-pointer hover:text-brand-green group flex items-center"
                onClick={() => toggleSort('title')}
              >
                <span className="font-semibold">Título</span>
                {getSortIcon('title')}
              </div>
              <div 
                className="w-[200px] min-w-[160px] max-w-[250px] truncate mr-2 flex items-center cursor-pointer hover:text-brand-green group"
                onClick={() => toggleSort('solicitante')}
              >
                <span className="font-semibold">Propietario</span>
                {getSortIcon('solicitante')}
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-3"></div>
                  <p className="text-gray-500">Cargando tareas...</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="flex items-center justify-center py-8 px-4">
                <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm max-w-md w-full">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar las tareas</h3>
                  <p className="text-red-600 mb-4">{loadError}</p>
                  <p className="text-gray-600 text-sm mb-5">Esto puede deberse a problemas de conexión, sesión expirada o un error en el servidor. Intente nuevamente o recargue la página.</p>
                  <div className="flex justify-center space-x-3">
                    <Button 
                      variant="outline" 
                      className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recargar página
                    </Button>
                    <Button 
                      variant="default" 
                      className="flex items-center bg-brand-green hover:bg-green-700" 
                      onClick={fetchTareasPendientes}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Reintentar ahora
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay tareas para mostrar</p>
                </div>
              </div>
            ) : (
              currentTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center px-4 py-2 border-b hover:bg-gray-100 cursor-pointer w-full max-w-full ${
                    selectedTasks.includes(task.id) ? "bg-green-50" : ""
                  } ${task.status === "completada" ? "opacity-70" : ""} ${
                    selectedTaskId === task.id ? "bg-brand-yellow/10 border-l-4 border-l-brand-yellow" : ""
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
                  <div className="w-[120px] min-w-[120px] text-gray-800 mr-2">{task.id}</div>
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
                  <div className="w-[200px] min-w-[160px] max-w-[250px] truncate text-gray-800 mr-2">
                    {task.details.solicitante}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {filteredTasks.length > 0 && (
            <div className="flex justify-between items-center p-4 border-t">
              <div className="text-sm text-gray-500">
                Mostrando {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, filteredTasks.length)} de {filteredTasks.length} tareas
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to display, centered around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={i}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
              {/* Encabezado */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Detalle del trámite</h1>
              </div>

              {/* Sección: Propietario */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green"></div>
                    <span className="ml-3 text-gray-600">Cargando detalles del trámite...</span>
                  </div>
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-red-700 text-center mb-2">Error al cargar detalles</h3>
                      <p className="text-red-600 text-center mb-3">{loadError}</p>
                      <p className="text-gray-600 text-sm text-center mb-4">Es posible que haya problemas con la conexión al servidor, que el trámite no esté disponible o que su sesión haya expirado. Puede intentar nuevamente o recargar la página.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center bg-brand-green hover:bg-green-700" 
                          onClick={() => {
                            if (selectedTaskId) {
                              const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === selectedTaskId);
                              if (tarea) {
                                fetchTramiteDetalle(tarea.tramite.trmId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reintentar ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !tramiteData ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 text-center mb-2">Datos no disponibles</h3>
                      <p className="text-gray-600 text-center mb-3">No se encontraron datos para este trámite</p>
                      <p className="text-gray-500 text-sm text-center mb-4">El trámite puede estar archivado, haber sido eliminado o no tener información registrada.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={closeDetailPanel}
                        >
                          Volver a la lista
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="bg-brand-green rounded-full h-4 w-4 mr-2"></div>
                      <h2 className="text-xl font-semibold text-brand-dark-blue">Propietario</h2>
                      {tramiteData && (
                        <span className="ml-auto text-gray-500 text-sm">Trámite #{tramiteData.data.tramite.trmId}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Número de Identificación</h3>
                        <p className="text-gray-800">{tramiteData.data.propietario.numeroIdentificacion}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
                        <p className="text-gray-800">
                          {tramiteData.data.propietario.correo || <span className="text-gray-400 italic">No registrado</span>}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Nombres</h3>
                        <p className="text-gray-800">{tramiteData.data.propietario.nombres}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Apellidos</h3>
                        <p className="text-gray-800">{tramiteData.data.propietario.apellidos}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                        <p className="text-gray-800">
                          {tramiteData.data.propietario.telefonoUno && tramiteData.data.propietario.telefonoUno !== "0" 
                            ? tramiteData.data.propietario.telefonoUno 
                            : <span className="text-gray-400 italic">No registrado</span>}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Estado del trámite</h3>
                        <Badge 
                          variant="outline" 
                          className={`${
                            tramiteData.data.tramite.estado === "PAGADO" 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }`}
                        >
                          {tramiteData.data.tramite.estado}
                        </Badge>
                      </div>
                    </div>

                    {/* Subsección: Escritura */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-gray-700 mb-3">Escritura</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Fecha de inscripción de escritura</h3>
                          <p className="text-gray-800">{tramiteData.data.datosEspecificos.fechaInscripcion}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Solicitud para</h3>
                          <p className="text-gray-800">{tramiteData.data.datosEspecificos.tipoSolicitud}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Valor del trámite</h3>
                          <p className="text-gray-800">${tramiteData.data.tramite.valor.toFixed(2)}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Fecha de pago</h3>
                          <p className="text-gray-800">
                            {tramiteData.data.tramite.fechaDePago ? 
                              new Date(tramiteData.data.tramite.fechaDePago).toLocaleDateString() : 
                              <span className="text-gray-400 italic">No registrado</span>
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sección: Predio */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green"></div>
                    <span className="ml-3 text-gray-600">Cargando datos del predio...</span>
                  </div>
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-red-700 text-center mb-2">Error de conexión</h3>
                      <p className="text-red-600 text-center mb-3">{loadError}</p>
                      <p className="text-gray-600 text-sm text-center mb-4">No pudimos acceder a la información del predio. Verifique su conexión a internet o permisos de acceso.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center bg-brand-green hover:bg-green-700" 
                          onClick={() => {
                            if (selectedTaskId) {
                              const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === selectedTaskId);
                              if (tarea) {
                                fetchTramiteDetalle(tarea.tramite.trmId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reintentar ahora
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !tramiteData ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 text-center mb-2">Información no disponible</h3>
                      <p className="text-gray-600 text-center mb-3">No hay datos disponibles del predio</p>
                      <p className="text-gray-500 text-sm text-center mb-4">Es posible que la información del predio no esté registrada o no esté asociada a este trámite.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => {
                            if (selectedTaskId) {
                              const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === selectedTaskId);
                              if (tarea) {
                                fetchTramiteDetalle(tarea.tramite.trmId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reintentar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="bg-brand-yellow rounded-full h-4 w-4 mr-2"></div>
                      <h2 className="text-xl font-semibold text-brand-dark-blue">Predio</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Clave Catastral</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.claveCatastral}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Número de Predio</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.numeroPredio}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Calles</h3>
                        <p className="text-gray-800">
                          {tramiteData.data.predio.calles === "S/N" ? 
                            <span>Sin nombre específico</span> : 
                            tramiteData.data.predio.calles
                          }
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Barrio/Sector</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.nombreBarrio}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Parroquia</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.nombreParroquia}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Número de lote</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.numeroLote}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">ID Parroquia</h3>
                        <p className="text-gray-800">{tramiteData.data.predio.idParroquia}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sección: Documentos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-brand-medium-blue rounded-full h-4 w-4 mr-2"></div>
                  <h2 className="text-xl font-semibold text-brand-dark-blue">Documentos</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green"></div>
                    <span className="ml-3 text-gray-600">Cargando documentos...</span>
                  </div>
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-red-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-red-700 text-center mb-2">Error al cargar documentos</h3>
                      <p className="text-red-600 text-center mb-3">{loadError}</p>
                      <p className="text-gray-600 text-sm text-center mb-4">No pudimos acceder a los documentos del trámite. Esto puede deberse a permisos insuficientes o problemas en el servidor de documentos.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center bg-brand-green hover:bg-green-700" 
                          onClick={() => {
                            if (selectedTaskId) {
                              const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === selectedTaskId);
                              if (tarea) {
                                fetchTramiteDetalle(tarea.tramite.trmId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Reintentar carga
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : !tramiteData ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 w-full max-w-lg shadow-sm">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <AlertCircle className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 text-center mb-2">Documentos no disponibles</h3>
                      <p className="text-gray-600 text-center mb-3">No encontramos documentos para este trámite</p>
                      <p className="text-gray-500 text-sm text-center mb-4">Es posible que aún no se hayan subido documentos o que no tenga acceso a ellos. Contacte al administrador si cree que esto es un error.</p>
                      <div className="flex justify-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 border-gray-300 flex items-center" 
                          onClick={() => window.location.reload()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Recargar página
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center bg-brand-green hover:bg-green-700" 
                          onClick={() => {
                            if (selectedTaskId) {
                              const tarea = tareasPendientes.find(t => t.tramite.trmId.toString() === selectedTaskId);
                              if (tarea) {
                                fetchTramiteDetalle(tarea.tramite.trmId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Verificar de nuevo
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {tramiteData.data.documentos.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay documentos disponibles para este trámite.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(tramiteData.data.documentos || []).map((doc) => {
                          // Determinar el icono basado en la extensión del archivo
                          const fileExt = doc.nombreOriginal?.split('.').pop()?.toLowerCase() || '';
                          let FileIcon = FileText;
                          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(fileExt)) {
                            FileIcon = FileImage;
                          }
                          
                          return (
                            <div 
                              key={doc.docId} 
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <FileIcon className={`h-8 w-8 ${
                                  fileExt === 'pdf' ? 'text-red-500' : 
                                  ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt) ? 'text-brand-medium-blue' : 
                                  ['xlsx', 'xls', 'csv'].includes(fileExt) ? 'text-brand-green' : 
                                  ['docx', 'doc'].includes(fileExt) ? 'text-brand-dark-blue' : 'text-gray-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{doc.nombreOriginal || 'Documento sin nombre'}</p>
                                  <p className="text-xs text-gray-500">
                                    Subido el {new Date(doc.fechaSubida).toLocaleDateString()} 
                                    {' • '} 
                                    <span className="uppercase">{fileExt || 'pdf'}</span>
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  toast({
                                    title: "Descargando documento",
                                    description: `Se está descargando ${doc.nombreOriginal}`,
                                  });
                                  // Aquí iría la lógica real de descarga
                                  // window.open(`/api/documentos/${doc.referenceId}/download`, '_blank');
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" /> Descargar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            
              {/* Sección: Tipo de Observaciones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-brand-dark-blue rounded-full h-4 w-4 mr-2"></div>
                  <h2 className="text-xl font-semibold text-brand-dark-blue">Evaluación</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-observaciones" className="text-base font-medium text-gray-700">
                      Tipo de observaciones:
                    </Label>
                    <Select
                      value={tipoObservaciones || ""}
                      onValueChange={(value) => setTipoObservaciones(value as 'Menores' | 'Mayores' | 'Ninguna')}
                    >
                      <SelectTrigger className="w-full max-w-xs focus:ring-brand-green focus:border-brand-green">
                        <SelectValue placeholder="Seleccione una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menores">Menores</SelectItem>
                        <SelectItem value="Mayores">Mayores</SelectItem>
                        <SelectItem value="Ninguna">Ninguna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botón de Elaborar Informe iprus - Solo visible cuando se selecciona "Menores" */}
                  {tipoObservaciones === 'Menores' && (
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-brand-medium-blue bg-blue-50 text-brand-medium-blue hover:bg-blue-100"
                        onClick={() => setIsIprusModalOpen(true)}
                      >
                        <FileSignature className="h-5 w-5 mr-2" />
                        Elaborar Informe iprus
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* IPRUS Report Dialog */}
      <IprusReportDialog 
        isOpen={isIprusModalOpen} 
        onClose={() => setIsIprusModalOpen(false)}
      />
    </div>
  )
}
