"use client"

import { FileText, Inbox, AlertCircle } from "lucide-react"

interface EmptyContentProps {
  selectedSection: string
}

export function EmptyContent({ selectedSection }: EmptyContentProps) {
  // Configuración para diferentes secciones
  const sectionConfig = {
    enviados: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Bandeja de Enviados",
      description: "Aquí se mostrarán los documentos que has enviado.",
    },
    archivados: {
      icon: <Inbox className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Documentos Archivados",
      description: "Aquí se mostrarán los documentos que has archivado.",
    },
    reasignados: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Documentos Reasignados",
      description: "Aquí se mostrarán los documentos que has reasignado a otros usuarios.",
    },
    elaboracion: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Documentos en Elaboración",
      description: "Aquí se mostrarán los documentos que estás elaborando actualmente.",
    },
    informados: {
      icon: <AlertCircle className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Documentos Informados",
      description: "Aquí se mostrarán los documentos de los que has sido informado.",
    },
    templates: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Plantillas de Documentos",
      description: "Aquí se mostrarán las plantillas disponibles para crear nuevos documentos.",
    },
    eliminados: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Documentos Eliminados",
      description: "Aquí se mostrarán los documentos que has eliminado.",
    },
    tareas: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Tareas Pendientes",
      description: "Aquí se mostrarán las tareas que tienes pendientes.",
    },
    seguimiento: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Seguimiento de Documentos",
      description: "Aquí podrás hacer seguimiento de tus documentos.",
    },
    administracion: {
      icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
      title: "Administración del Sistema",
      description: "Aquí podrás administrar la configuración del sistema.",
    },
  }

  // Obtener la configuración para la sección seleccionada o usar valores predeterminados
  const config = sectionConfig[selectedSection] || {
    icon: <FileText className="h-16 w-16 text-gray-300 mb-4" />,
    title: selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1),
    description: "Selecciona una opción del menú para ver su contenido.",
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        {config.icon}
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{config.title}</h2>
        <p className="text-gray-500">{config.description}</p>
      </div>
    </div>
  )
}
