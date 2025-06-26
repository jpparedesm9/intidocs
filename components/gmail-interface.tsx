"use client"

import { useState, useEffect } from "react"
import {
  Send,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Inbox,
  Edit3,
  Trash2,
  Mail,
  FileText,
  Box,
  Plus,
  X,
  CheckSquare,
  Eye,
  Settings,
  Bell,
  LayoutGrid,
  History,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GmailTopBar } from "./gmail-top-bar"
import { DynamicContent } from "./dynamic-content"
import { Toaster } from "@/components/ui/toaster"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function GmailInterface() {
  const [expandedSections, setExpandedSections] = useState({
    tramites: true,
    folders: true,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMenuItems, setFilteredMenuItems] = useState<string[]>([])
  const { toast } = useToast()
  
  // Lista de todos los elementos del menú disponibles para filtrar
  const allMenuItems = [
    "dashboard", "tareas", "seguimiento", "administracion", "recibidos", 
    "enviados", "archivados", "reasignados", "elaboracion", "enviar", 
    "historial", "informados", "templates", "eliminados"
  ]
  
  // Nombres legibles para cada elemento del menú
  const menuItemLabels: Record<string, string> = {
    dashboard: "Dashboard",
    tareas: "Tareas",
    seguimiento: "Seguimiento",
    administracion: "Administración",
    recibidos: "Recibidos",
    enviados: "Enviados",
    archivados: "Archivados",
    reasignados: "Reasignados",
    elaboracion: "En Elaboración",
    enviar: "Enviar",
    historial: "Historial",
    informados: "Informados",
    templates: "Templates",
    eliminados: "Eliminados"
  }
  
  // Función para resaltar el texto coincidente en un elemento del menú
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-blue-700/50 text-white font-medium px-0.5 rounded">{part}</span> 
        : part
    );
  };
  
  // Efecto para filtrar los elementos del menú basados en la búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Si no hay búsqueda, mostrar todos los elementos
      setFilteredMenuItems(allMenuItems);
      return;
    }
    
    // Filtrar elementos que coincidan con la búsqueda
    const query = searchQuery.toLowerCase().trim();
    const filtered = allMenuItems.filter(itemId => 
      menuItemLabels[itemId].toLowerCase().includes(query)
    );
    
    setFilteredMenuItems(filtered);
  }, [searchQuery]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleComposeClick = async () => {
    try {
      console.log("Compose button clicked, creating new document...")
      
      // Switch to the compose view immediately to show loading state
      setSelectedMenuItem("compose")
      
      // Log that we're calling the API
      console.log("Calling API to create document")
      
      try {
        // Crear documento directamente con asunto en blanco
        const result = await apiClient.createDocument({
          subject: "Sin asunto",
          tags: [],
        })
  
        console.log("API response for document creation:", result)
  
        if (result.success && result.data?.documentId) {
          // Set the document ID to trigger the editor to load it
          setCurrentDocumentId(result.data.documentId)
          
          // Mostrar notificación de éxito
          toast({
            title: "Documento creado",
            description: "Se ha creado un nuevo documento sin asunto",
            variant: "success",
          })
        } else {
          console.warn("API returned success=false or missing documentId:", result)
          // Even if API fails, still create a local document (fallback)
          setCurrentDocumentId(null) // This will trigger creating a new local document
          
          throw new Error(result.message || "Error al crear el documento")
        }
      } catch (error) {
        console.error("Error in API call for document creation:", error)
        // If API fails, still create a local document
        setCurrentDocumentId(null)
        
        // Mostrar mensaje de error pero permitir continuar
        toast({
          title: "Error en servidor",
          description: "Creando documento local en su lugar",
          variant: "warning",
        })
      }
    } catch (error) {
      console.error("Fatal error in document creation:", error)
      // Mostrar mensaje de error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el documento. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }
  
  // Manejador para los clics del menú - para resolver problema con documentos abiertos
  const handleMenuItemClick = (itemId: string) => {
    // Limpiar el documento actual cuando se selecciona otro elemento del menú
    setCurrentDocumentId(null)
    setSelectedMenuItem(itemId)
    
    // En móvil, cerrar el menú después de seleccionar un elemento
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }
  
  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <SidebarProvider>
      <div className={`flex flex-col h-screen w-screen bg-white ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Top Bar with Search, Profile, and Sidebar Toggle */}
      <GmailTopBar toggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

      {/* Main content - adjusted to respect the top bar height */}
      <div 
        id="main-layout-container" 
        className="flex w-full overflow-hidden mt-14" 
        style={{ 
          display: 'flex', 
          width: '100%', 
          position: 'relative', 
          height: 'calc(100vh - 3.5rem)' 
        }}
      >
        {/* Left Sidebar - with fixed width and improved styling */}
        <div 
          id="sidebar-container" 
          style={{ 
            width: sidebarCollapsed ? '4rem' : '16rem', 
            transition: 'width 0.3s ease-in-out, background-color 0.3s ease',
            flexShrink: 0,
            flexGrow: 0,
            position: 'relative',
            zIndex: 15,
            maxWidth: sidebarCollapsed ? '4rem' : '16rem',
            boxSizing: 'border-box',
            height: '100%',
            paddingTop: '0',
            overflowX: 'hidden',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4A5568 #1a1d21',
            paddingRight: '2px', // Adds some spacing for the scrollbar
            background: 'linear-gradient(180deg, #1a1d21 0%, #2d3748 100%)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          className="border-r border-gray-700/30 text-white md:block hidden custom-scrollbar"
        >
          <Sidebar className="w-full h-full" style={{ paddingTop: '3.5rem' }}> {/* Padding exacto para alinearse con la barra superior */}
            <SidebarHeader className="py-2 flex flex-col space-y-2 w-full mb-0 pb-0" style={{ width: '100%', padding: '0', boxSizing: 'border-box' }}>
              {/* User Identity Widget */}
              <div 
                className={`flex items-center cursor-pointer rounded-md ${sidebarCollapsed ? 'justify-center w-8 mx-auto p-1.5' : 'justify-between w-full p-1.5'} 
                           border border-gray-700 hover:border-gray-600 transition-all duration-200`}
                style={!sidebarCollapsed ? { width: '100%', margin: '0 1rem', boxSizing: 'border-box' } : {}}
                onClick={() => {
                  // Aquí iría la funcionalidad para abrir un menú desplegable de selección de perfil
                  alert("Selector de perfiles - Funcionalidad por implementar")
                }}
              >
                {/* Avatar del usuario */}
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-xs">
                    JP
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <span className="font-medium text-xs text-gray-200 line-clamp-1">
                        Juan Pérez
                      </span>
                      <div className="flex items-center">
                        <span className="text-[10px] text-gray-400 line-clamp-1">
                          Analista
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Flecha indicadora en el lado derecho - solo visible cuando no está colapsado */}
                {!sidebarCollapsed && (
                  <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
                )}
              </div>
              
              {/* Botón de Nuevo Documento - Comentado para ocultarlo
              {sidebarCollapsed ? (
                <div style={{ width: '100% !important', padding: '0 1rem', boxSizing: 'border-box' }}>
                  <button 
                    onClick={handleComposeClick}
                    className="text-blue-400 hover:text-blue-500 border border-blue-400 hover:border-blue-500 rounded-md w-8 h-8 flex items-center justify-center relative tooltip-container transition-all duration-200"
                    data-tooltip="Nuevo Documento"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    <span className="tooltip">Nuevo Documento</span>
                  </button>
                </div>
              ) : (
                <div style={{ width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
                  <button
                    onClick={handleComposeClick}
                    className="text-blue-400 hover:text-blue-500 border border-blue-400 hover:border-blue-500 rounded-md py-1.5 px-2 flex items-center justify-between transition-colors duration-200 group box-border mx-0"
                    style={{ width: '100%', display: 'flex', boxSizing: 'border-box' }}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2 flex-shrink-0">
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                      <span className="text-xs font-medium tracking-wide truncate">Nuevo documento</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-blue-400 flex-shrink-0 ml-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              )} */}
              
              {/* Caja de búsqueda - solo visible cuando el sidebar está expandido */}
              {!sidebarCollapsed && (
                <div style={{ width: '100%', padding: '0 1rem', boxSizing: 'border-box' }}>
                  <div className="relative w-full" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar en el menú..."
                      aria-label="Buscar en los elementos del menú"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-8 pr-8 py-1.5 w-full bg-gray-800 border ${searchQuery ? 'border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' : 'border-gray-700'} focus:border-blue-400 focus:ring-0 rounded-md text-xs text-gray-200 placeholder:text-gray-500 transition-all duration-200`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                      {searchQuery ? (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-gray-400 hover:text-gray-200 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      ) : (
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SidebarHeader>
            <SidebarContent className="px-4 space-y-0 mt-0">
              {/* Trámites Section */}
              <div className="mt-0">
                {/* Mensaje cuando no hay resultados */}
                {filteredMenuItems.length === 0 && searchQuery && (
                  <div className="py-6 text-center text-gray-400 text-sm italic mx-2">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-5 w-5 text-gray-500" />
                      <p>No se encontraron resultados</p>
                      <p className="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
                    </div>
                  </div>
                )}
                <SidebarMenu className="w-full -mt-0">
                  {/* Si el Dashboard está en la lista filtrada o no hay búsqueda, mostrarlo */}
                  {(filteredMenuItems.includes("dashboard") || !searchQuery) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "dashboard"}
                        className={`py-1 ${selectedMenuItem !== "dashboard" ? "hover:bg-gray-700/50 hover:backdrop-blur-sm" : "hover:text-white"} sidebar-menu-button transition-all duration-200 ${
                          selectedMenuItem === "dashboard"
                            ? "text-gray-300 font-medium w-full"
                            : "text-gray-300"
                        } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                        onClick={() => handleMenuItemClick("dashboard")}
                        title={sidebarCollapsed ? "Dashboard" : ""}
                      >
                        <LayoutGrid className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"} transition-transform duration-200 group-hover:scale-110`} />
                        {!sidebarCollapsed && <span>{searchQuery ? highlightText("Dashboard", searchQuery) : "Dashboard"}</span>}
                      </SidebarMenuButton>
                      {selectedMenuItem === "dashboard" && (
                        <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
                {!sidebarCollapsed && (
                  <div
                    onClick={() => toggleSection("tramites")}
                    className="flex items-center px-4 py-1 my-1 text-sm font-semibold tracking-wider text-gray-300/90 cursor-pointer hover:bg-gray-700/40 hover:text-white rounded-md transition-colors duration-200"
                  >
                    {expandedSections.tramites ? (
                      <ChevronDown className="h-4 w-4 mr-2 text-blue-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-400" />
                    )}
                    <span className="text-xs tracking-widest">TRÁMITES</span>
                    <div className="ml-auto flex items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-full">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                {(expandedSections.tramites || sidebarCollapsed) && (
                  <SidebarMenu className="w-full space-y-0.5">
                    {/* Mostrar mensaje de no resultados para TRÁMITES si corresponde */}
                    {!sidebarCollapsed && searchQuery && 
                     !filteredMenuItems.some(item => ["dashboard", "tareas", "seguimiento", "administracion"].includes(item)) && (
                      <div className="py-2 px-4 text-center text-gray-400 text-xs italic">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                          <span>Sin coincidencias en TRÁMITES</span>
                        </div>
                      </div>
                    )}
                    {/* Filtrado de elementos del menú de trámites */}
                    {(filteredMenuItems.includes("tareas") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "tareas"}
                          className={`py-1 ${selectedMenuItem !== "tareas" ? "hover:bg-gray-700/50 hover:backdrop-blur-sm" : "hover:text-white"} sidebar-menu-button transition-all duration-200 ${
                            selectedMenuItem === "tareas"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("tareas")}
                          title={sidebarCollapsed ? "Tareas" : ""}
                        >
                          <CheckSquare className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"} transition-transform duration-200 group-hover:scale-110`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Tareas", searchQuery) : "Tareas"}</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "tareas" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("seguimiento") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "seguimiento"}
                          className={`py-1 ${selectedMenuItem !== "seguimiento" ? "hover:bg-gray-700/50 hover:backdrop-blur-sm" : "hover:text-white"} sidebar-menu-button transition-all duration-200 ${
                            selectedMenuItem === "seguimiento"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("seguimiento")}
                          title={sidebarCollapsed ? "Seguimiento" : ""}
                        >
                          <Eye className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"} transition-transform duration-200 group-hover:scale-110`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Seguimiento", searchQuery) : "Seguimiento"}</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "seguimiento" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("administracion") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "administracion"}
                          className={`py-1 ${selectedMenuItem !== "administracion" ? "hover:bg-gray-700/50 hover:backdrop-blur-sm" : "hover:text-white"} sidebar-menu-button transition-all duration-200 ${
                            selectedMenuItem === "administracion"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("administracion")}
                          title={sidebarCollapsed ? "Administración" : ""}
                        >
                          <Settings className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"} transition-transform duration-200 group-hover:scale-110`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Administración", searchQuery) : "Administración"}</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "administracion" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                )}
              </div>

              {/* Folders Section */}
              <div className="mt-2">
                {!sidebarCollapsed && (
                  <div
                    onClick={() => toggleSection("folders")}
                    className="flex items-center px-4 py-1 my-1 text-sm font-semibold tracking-wider text-gray-300/90 cursor-pointer hover:bg-gray-700/40 hover:text-white rounded-md transition-colors duration-200"
                  >
                    {expandedSections.folders ? (
                      <ChevronDown className="h-4 w-4 mr-2 text-blue-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-400" />
                    )}
                    <span className="text-xs tracking-widest">BANDEJAS</span>
                    <div className="ml-auto flex items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-full">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
                {(expandedSections.folders || sidebarCollapsed) && (
                  <SidebarMenu className="w-full space-y-0.5">
                    {/* Mostrar mensaje de no resultados para BANDEJAS si corresponde */}
                    {!sidebarCollapsed && searchQuery && 
                     !filteredMenuItems.some(item => ["recibidos", "enviados", "archivados", "reasignados", "elaboracion", "enviar", "historial", "informados", "templates", "eliminados"].includes(item)) && (
                      <div className="py-2 px-4 text-center text-gray-400 text-xs italic">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                          <span>Sin coincidencias en BANDEJAS</span>
                        </div>
                      </div>
                    )}
                    {/* Elementos de Bandejas filtrados por búsqueda */}
                    {(filteredMenuItems.includes("recibidos") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "recibidos"}
                          className={`py-1 ${selectedMenuItem !== "recibidos" ? "hover:bg-gray-700/50 hover:backdrop-blur-sm" : "hover:text-white"} sidebar-menu-button transition-all duration-200 tooltip-container ${
                            selectedMenuItem === "recibidos"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("recibidos")}
                        >
                          <Inbox className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"} transition-transform duration-200 group-hover:scale-110`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Recibidos", searchQuery) : "Recibidos"}</span>}
                          {!sidebarCollapsed && <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">8</span>}
                          {sidebarCollapsed && <span className="tooltip">Recibidos (8)</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "recibidos" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("enviados") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "enviados"}
                          className={`py-2 ${selectedMenuItem !== "enviados" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "enviados"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("enviados")}
                        >
                          <Send className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Enviados", searchQuery) : "Enviados"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Enviados</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "enviados" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("archivados") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "archivados"}
                          className={`py-2 ${selectedMenuItem !== "archivados" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "archivados"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("archivados")}
                        >
                          <Box className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Archivados", searchQuery) : "Archivados"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Archivados</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "archivados" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    {(filteredMenuItems.includes("reasignados") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "reasignados"}
                          className={`py-2 ${selectedMenuItem !== "reasignados" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "reasignados"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("reasignados")}
                        >
                          <Mail className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Reasignados", searchQuery) : "Reasignados"}</span>}
                          {!sidebarCollapsed && <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">43</span>}
                          {sidebarCollapsed && <span className="tooltip">Reasignados (43)</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "reasignados" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("elaboracion") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "elaboracion"}
                          className={`py-2 ${selectedMenuItem !== "elaboracion" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "elaboracion"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("elaboracion")}
                        >
                          <Edit3 className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("En Elaboración", searchQuery) : "En Elaboración"}</span>}
                          {sidebarCollapsed && <span className="tooltip">En Elaboración</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "elaboracion" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("enviar") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "enviar"}
                          className={`py-2 ${selectedMenuItem !== "enviar" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "enviar"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("enviar")}
                        >
                          <Send className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Enviar", searchQuery) : "Enviar"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Enviar</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "enviar" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("historial") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "historial"}
                          className={`py-2 ${selectedMenuItem !== "historial" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "historial"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("historial")}
                        >
                          <History className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Historial", searchQuery) : "Historial"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Historial</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "historial" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("informados") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "informados"}
                          className={`py-2 ${selectedMenuItem !== "informados" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "informados"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("informados")}
                        >
                          <Bell className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Informados", searchQuery) : "Informados"}</span>}
                          {!sidebarCollapsed && <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">4</span>}
                          {sidebarCollapsed && <span className="tooltip">Informados (4)</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "informados" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("templates") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "templates"}
                          className={`py-2 ${selectedMenuItem !== "templates" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "templates"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("templates")}
                        >
                          <FileText className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Templates", searchQuery) : "Templates"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Templates</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "templates" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                    
                    {(filteredMenuItems.includes("eliminados") || !searchQuery) && (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedMenuItem === "eliminados"}
                          className={`py-2 ${selectedMenuItem !== "eliminados" ? "hover:bg-gray-700/50" : "hover:text-white"} sidebar-menu-button tooltip-container ${
                            selectedMenuItem === "eliminados"
                              ? "text-gray-300 font-medium w-full"
                              : "text-gray-300"
                          } ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                          onClick={() => handleMenuItemClick("eliminados")}
                        >
                          <Trash2 className={`h-4 w-4 ${sidebarCollapsed ? "" : "mr-3"}`} />
                          {!sidebarCollapsed && <span>{searchQuery ? highlightText("Eliminados", searchQuery) : "Eliminados"}</span>}
                          {sidebarCollapsed && <span className="tooltip">Eliminados</span>}
                        </SidebarMenuButton>
                        {selectedMenuItem === "eliminados" && (
                          <div className="absolute left-[-2px] top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                        )}
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                )}
              </div>
            </SidebarContent>
          </Sidebar>
        </div>

        {/* Mobile buttons - only visible on small screens */}
        <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
          {/* Botón de Nuevo Documento en móvil - Comentado para ocultarlo
          <Button
            onClick={handleComposeClick}
            className="rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-xl px-6 py-6"
            style={{
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.5)"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </Button>
          */}
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white shadow-lg"
            style={{
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)"
            }}
            size="icon"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile sidebar - only visible when toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20">
            <div className="h-full w-64 bg-[#202124] text-white overflow-auto">
              {/* Mobile sidebar content - copy of desktop sidebar */}
              <div className="p-4 pt-12 pb-2">
                {/* Botón de Nuevo Documento en sidebar móvil - Comentado para ocultarlo
                <Button
                  onClick={handleComposeClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-3 px-6 flex items-center justify-start"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Nuevo Documento
                </Button>
                */}
              </div>
              {/* Mobile sidebar menu items */}
              <div className="p-4">
                {/* Barra de búsqueda para versión móvil */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar en el menú..."
                    aria-label="Buscar en los elementos del menú"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-8 pr-8 py-2 w-full bg-gray-800 border ${searchQuery ? 'border-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' : 'border-gray-700'} focus:border-blue-400 focus:ring-0 rounded-md text-xs text-gray-200 placeholder:text-gray-500 transition-all duration-200`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    {searchQuery ? (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-gray-200 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    ) : (
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Mensaje cuando no hay resultados */}
                {filteredMenuItems.length === 0 && searchQuery && (
                  <div className="py-6 text-center text-gray-400 text-sm italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="h-5 w-5 text-gray-500" />
                      <p>No se encontraron resultados</p>
                      <p className="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-2">
                  <div className="flex items-center px-4 py-1 text-sm font-medium text-gray-300">TRÁMITES</div>
                  <div className="mt-2 pl-4">
                    {(filteredMenuItems.includes("dashboard") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "dashboard" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "dashboard" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("dashboard")}
                      >
                        <LayoutGrid className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Dashboard", searchQuery) : "Dashboard"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("tareas") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "tareas" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "tareas" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("tareas")}
                      >
                        <CheckSquare className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Tareas", searchQuery) : "Tareas"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("seguimiento") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "seguimiento" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "seguimiento" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("seguimiento")}
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Seguimiento", searchQuery) : "Seguimiento"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("administracion") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "administracion" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "administracion" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("administracion")}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Administración", searchQuery) : "Administración"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center px-4 py-1 text-sm font-medium text-gray-300">BANDEJAS</div>
                  <div className="mt-2 pl-4">
                    {(filteredMenuItems.includes("recibidos") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "recibidos" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "recibidos" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("recibidos")}
                      >
                        <Inbox className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Recibidos", searchQuery) : "Recibidos"}</span>
                        <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">8</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("enviados") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "enviados" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "enviados" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("enviados")}
                      >
                        <Send className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Enviados", searchQuery) : "Enviados"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("archivados") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "archivados" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "archivados" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("archivados")}
                      >
                        <Box className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Archivados", searchQuery) : "Archivados"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("reasignados") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "reasignados" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "reasignados" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("reasignados")}
                      >
                        <Mail className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Reasignados", searchQuery) : "Reasignados"}</span>
                        <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">43</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("elaboracion") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "elaboracion" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "elaboracion" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("elaboracion")}
                      >
                        <Edit3 className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("En Elaboración", searchQuery) : "En Elaboración"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("enviar") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "enviar" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "enviar" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("enviar")}
                      >
                        <Send className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Enviar", searchQuery) : "Enviar"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("historial") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "historial" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "historial" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("historial")}
                      >
                        <History className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Historial", searchQuery) : "Historial"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("informados") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "informados" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "informados" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("informados")}
                      >
                        <Bell className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Informados", searchQuery) : "Informados"}</span>
                        <span className="ml-auto text-sm px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium -mr-1">4</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("templates") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "templates" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "templates" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("templates")}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Templates", searchQuery) : "Templates"}</span>
                      </div>
                    )}
                    {(filteredMenuItems.includes("eliminados") || !searchQuery) && (
                      <div
                        className={`py-2 flex items-center ${selectedMenuItem !== "eliminados" ? "hover:bg-gray-700/50" : "hover:text-white"} rounded-md px-4 cursor-pointer ${selectedMenuItem === "eliminados" ? "text-gray-300 font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("eliminados")}
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        <span>{searchQuery ? highlightText("Eliminados", searchQuery) : "Eliminados"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-2 right-2 text-white"
                variant="ghost"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Content Area - con flex-grow para ocupar el espacio restante */}
        <div 
          id="dynamic-content-container" 
          className="h-full overflow-auto"
          style={{ 
            flex: '1 1 auto',
            width: sidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 16rem)',
            maxWidth: sidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 16rem)',
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            pointerEvents: 'auto',
            zIndex: 15
          }}
        >
          <DynamicContent 
            selectedMenuItem={selectedMenuItem} 
            documentId={currentDocumentId} 
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  </SidebarProvider>
  )
}