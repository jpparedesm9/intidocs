"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Search, Eye, Save, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DocumentHeaderExpandedProps {
  onSave: () => void
  isSaving: boolean
  recipientCount?: number
  onOpenRecipientSearch?: () => void
  onOpenPreview?: () => void
}

export default function DocumentHeaderExpanded({
  onSave,
  isSaving,
  recipientCount = 0,
  onOpenRecipientSearch,
  onOpenPreview,
}: DocumentHeaderExpandedProps) {
  return (
    <div 
      className="bg-white border-b border-gray-200 px-4 py-2" 
      style={{ position: 'relative', zIndex: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Buscar De/Para */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRecipientSearch}
            className="h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black"
            title="Buscar remitentes y destinatarios"
          >
            <Search className="h-4 w-4 text-black" />
            Buscar De/Para
            {recipientCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-gray-400 text-black">
                {recipientCount}
              </Badge>
            )}
          </Button>

          {/* Vista Previa button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreview}
            className="h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black"
            title="Vista previa del documento"
          >
            <Eye className="h-4 w-4 text-black" />
            Vista Previa
          </Button>

          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className={cn("h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black", 
                        isSaving && "opacity-50 cursor-not-allowed")}
          >
            <Save className="h-4 w-4 text-black" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>

          {/* Enviar button */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black"
            title="Enviar documento"
          >
            <Send className="h-4 w-4 text-black" />
            Enviar
          </Button>
        </div>

        {/* Right side - empty */}
        <div className="flex items-center space-x-2"></div>
      </div>
    </div>
  )
}