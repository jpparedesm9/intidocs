"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
  height?: string
}

export default function SimpleModal({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-4xl",
  height = "h-[80vh]"
}: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Cerrar el modal al hacer clic fuera - desactivado para evitar cierres accidentales
  useEffect(() => {
    // La siguiente función está comentada para evitar cierres accidentales al hacer clic fuera
    // function handleClickOutside(event: MouseEvent) {
    //   if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
    //     onClose()
    //   }
    // }

    if (isOpen) {
      // document.addEventListener("mousedown", handleClickOutside)
      // Prevenir scroll en el body cuando el modal está abierto
      document.body.style.overflow = "hidden"
      console.log("⚪ SimpleModal: abriendo modal, width:", width, "height:", height)
    }

    return () => {
      // document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
      console.log("⚪ SimpleModal: cerrando modal")
    }
  }, [isOpen, onClose, width, height])

  // Manejar escape para cerrar
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
      <div 
        ref={modalRef}
        className={cn(
          "bg-white rounded-lg shadow-xl overflow-hidden flex flex-col",
          width,
          height,
          "w-[95vw] h-[95vh]"
        )}
        style={{display: 'flex', flexDirection: 'column'}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-white sticky top-0 z-20 flex-shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content - Usamos flex-1 para que ocupe todo el espacio disponible */}
        <div className="flex-1 overflow-auto min-h-0" style={{height: 'calc(100% - 60px)'}}>
          {children}
        </div>
      </div>
    </div>
  )
}