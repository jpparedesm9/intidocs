"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Mail, Plus, X, CheckSquare, Eye, Settings, LayoutGrid } from "lucide-react"
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

export default function GmailInterface() {
  const [expandedSections, setExpandedSections] = useState({
    tramites: true,
    folders: true,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard")

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleComposeClick = () => {
    // Open editor in a new tab
    window.open("/compose", "_blank")
  }

  const handleMenuItemClick = (itemId: string) => {
    setSelectedMenuItem(itemId)
    // En móvil, cerrar el menú después de seleccionar un elemento
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-screen bg-white">
        {/* Top Bar with Search and Profile */}
        <GmailTopBar />

        <div className="flex flex-1 overflow-hidden w-full max-w-full pr-0 mr-0 relative">
          {/* Left Sidebar */}
          <Sidebar className="border-r border-gray-200 w-64 flex-shrink-0 bg-[#202124] text-white md:block hidden z-10 pt-14">
            <SidebarHeader className="p-4 pt-6">
              {/* Botón "Nuevo Documento" - Comentado temporalmente
              <Button
                onClick={handleComposeClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-3 px-6 flex items-center justify-start"
              >
                <Edit3 className="h-4 w-4 mr-3" />
                Nuevo Documento
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
              */}
            </SidebarHeader>
            <SidebarContent className="px-2">
              {/* Trámites Section */}
              <div className="mt-6">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={selectedMenuItem === "dashboard"}
                      className={`py-2 hover:bg-gray-700 ${
                        selectedMenuItem === "dashboard"
                          ? "bg-blue-600 text-white font-medium rounded-md"
                          : "text-gray-300"
                      }`}
                      onClick={() => handleMenuItemClick("dashboard")}
                    >
                      <LayoutGrid className="h-4 w-4 mr-3" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                    {selectedMenuItem === "dashboard" && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
                <div
                  onClick={() => toggleSection("tramites")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  {expandedSections.tramites ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  TRÁMITES
                  <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedSections.tramites && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "tareas"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "tareas"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("tareas")}
                      >
                        <CheckSquare className="h-4 w-4 mr-3" />
                        <span>Tareas</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "tareas" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "seguimiento"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "seguimiento"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("seguimiento")}
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        <span>Seguimiento</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "seguimiento" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "administracion"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "administracion"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("administracion")}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        <span>Administración</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "administracion" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>

              {/* Folders Section - Comentado temporalmente
              <div className="mt-2">
                <div
                  onClick={() => toggleSection("folders")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  {expandedSections.folders ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  BANDEJAS
                  <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedSections.folders && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "recibidos"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "recibidos"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("recibidos")}
                      >
                        <Inbox className="h-4 w-4 mr-3" />
                        <span>Recibidos</span>
                        <span className="ml-auto text-sm">8</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "recibidos" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "enviados"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "enviados"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("enviados")}
                      >
                        <Send className="h-4 w-4 mr-3" />
                        <span>Enviados</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "enviados" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "archivados"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "archivados"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("archivados")}
                      >
                        <Box className="h-4 w-4 mr-3" />
                        <span>Archivados</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "archivados" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "reasignados"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "reasignados"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("reasignados")}
                      >
                        <Mail className="h-4 w-4 mr-3" />
                        <span>Reasignados</span>
                        <span className="ml-auto text-sm">43</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "reasignados" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "elaboracion"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "elaboracion"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("elaboracion")}
                      >
                        <Edit3 className="h-4 w-4 mr-3" />
                        <span>En Elaboraci&oacute;n</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "elaboracion" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "informados"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "informados"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("informados")}
                      >
                        <Bell className="h-4 w-4 mr-3" />
                        <span>Informados</span>
                        <span className="ml-auto text-sm">4</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "informados" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "templates"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "templates"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("templates")}
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        <span>Templates</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "templates" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={selectedMenuItem === "eliminados"}
                        className={`py-2 hover:bg-gray-700 ${
                          selectedMenuItem === "eliminados"
                            ? "bg-blue-600 text-white font-medium rounded-md"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleMenuItemClick("eliminados")}
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        <span>Eliminados</span>
                      </SidebarMenuButton>
                      {selectedMenuItem === "eliminados" && (
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-400 rounded-r-md"></div>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>
              */}
            </SidebarContent>
          </Sidebar>

          {/* Mobile buttons - only visible on small screens */}
          <div className="md:hidden fixed bottom-4 left-4 z-10 flex gap-2">
            {/* Botón móvil "Nuevo" - Comentado temporalmente
            <Button
              onClick={handleComposeClick}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Edit3 className="h-5 w-5 mr-2" />
              Nuevo
            </Button>
            */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
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
                  {/* Botón móvil "Nuevo Documento" - Comentado temporalmente
                  <Button
                    onClick={handleComposeClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-3 px-6 flex items-center justify-start"
                  >
                    <Edit3 className="h-4 w-4 mr-3" />
                    Nuevo Documento
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                  */}
                </div>
                {/* Mobile sidebar menu items */}
                <div className="p-4">
                  <div className="mt-2">
                    <div className="flex items-center px-4 py-1 text-sm font-medium text-gray-300">TRÁMITES</div>
                    <div className="mt-2 pl-4">
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "dashboard" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("dashboard")}
                      >
                        <LayoutGrid className="h-4 w-4 mr-3" />
                        <span>Dashboard</span>
                      </div>
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "tareas" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("tareas")}
                      >
                        <CheckSquare className="h-4 w-4 mr-3" />
                        <span>Tareas</span>
                      </div>
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "seguimiento" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("seguimiento")}
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        <span>Seguimiento</span>
                      </div>
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "administracion" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("administracion")}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        <span>Administración</span>
                      </div>
                    </div>
                  </div>

                  {/* Sección móvil "BANDEJAS" - Comentada temporalmente
                  <div className="mt-4">
                    <div className="flex items-center px-4 py-1 text-sm font-medium text-gray-300">BANDEJAS</div>
                    <div className="mt-2 pl-4">
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "recibidos" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("recibidos")}
                      >
                        <Inbox className="h-4 w-4 mr-3" />
                        <span>Recibidos</span>
                        <span className="ml-auto text-sm">8</span>
                      </div>
                      <div
                        className={`py-2 flex items-center hover:bg-gray-700 rounded-md px-4 cursor-pointer ${selectedMenuItem === "enviados" ? "bg-blue-600 text-white font-medium" : "text-gray-300"}`}
                        onClick={() => handleMenuItemClick("enviados")}
                      >
                        <Send className="h-4 w-4 mr-3" />
                        <span>Enviados</span>
                      </div>
                    </div>
                  </div>
                  */}
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

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-hidden">
            <DynamicContent selectedMenuItem={selectedMenuItem} />
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </SidebarProvider>
  )
}
