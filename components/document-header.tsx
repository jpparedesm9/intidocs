"use client"

import { useState, useRef, useEffect } from "react"
import { Save, ChevronDown, Search, X, User, Send } from "lucide-react"

interface DocumentHeaderProps {
  title: string
  setTitle: (title: string) => void
  onSave: () => void
  documents?: Array<{ id: string; title: string }>
  onLoad?: (id: string) => void
  isSaving?: boolean
  recipients?: {
    to: Array<{ id: string; name: string; email: string; institution?: string }>
    cc: Array<{ id: string; name: string; email: string; institution?: string }>
  }
  sender?: { id: string; name: string; email: string; institution?: string } | null
  onRecipientRemove?: (id: string, type: "to" | "cc") => void
  onSenderRemove?: () => void
  onOpenRecipientSearch?: () => void
}

export default function DocumentHeader({
  title,
  setTitle,
  onSave,
  documents,
  onLoad,
  isSaving = false,
  recipients = { to: [], cc: [] },
  sender = null,
  onRecipientRemove,
  onSenderRemove,
  onOpenRecipientSearch,
}: DocumentHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Document title and type */}
        <div className="flex items-center space-x-4">
          {/* Subject field */}
          <div className="flex items-center">
            <label htmlFor="document-subject" className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">
              Asunto:
            </label>
            <input
              id="document-subject"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1 min-w-[300px]"
              placeholder="Título del documento"
            />
          </div>

          {/* Document type selector */}
          <div className="flex items-center">
            <label htmlFor="document-type" className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap">
              Tipo de Documento:
            </label>
            <select
              id="document-type"
              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              defaultValue="2"
            >
              <option value="1">Memorando</option>
              <option value="2">Oficio</option>
              <option value="3">Circular</option>
              <option value="4">Resolución</option>
              <option value="5">Informe</option>
              <option value="6">Solicitud</option>
              <option value="7">Acta</option>
              <option value="8">Certificado</option>
            </select>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </>
            )}
          </button>

          {documents && documents.length > 0 && onLoad && (
            <div className="relative" ref={dropdownRef}>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          onLoad(doc.id)
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 truncate"
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipients and Sender section */}
      <div className="mt-3 flex flex-wrap items-center">
        {/* Search button */}
        <button
          onClick={onOpenRecipientSearch}
          className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors mr-3"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar De/Para
        </button>

        {/* Sender display */}
        {sender && (
          <div className="flex items-center mr-4">
            <span className="text-sm font-medium text-gray-700 mr-2">De:</span>
            <div className="flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs">
              <Send className="h-3 w-3 mr-1" />
              <span>{sender.name}</span>
              {onSenderRemove && (
                <button onClick={onSenderRemove} className="ml-1 hover:text-green-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recipients display */}
        <div className="flex flex-wrap items-center gap-2">
          {/* To recipients */}
          {recipients.to.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Para:</span>
              <div className="flex flex-wrap gap-1">
                {recipients.to.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs"
                  >
                    <User className="h-3 w-3 mr-1" />
                    <span>{recipient.name}</span>
                    {onRecipientRemove && (
                      <button
                        onClick={() => onRecipientRemove(recipient.id, "to")}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CC recipients */}
          {recipients.cc.length > 0 && (
            <div className="flex items-center ml-3">
              <span className="text-sm font-medium text-gray-700 mr-2">CC:</span>
              <div className="flex flex-wrap gap-1">
                {recipients.cc.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs"
                  >
                    <User className="h-3 w-3 mr-1" />
                    <span>{recipient.name}</span>
                    {onRecipientRemove && (
                      <button
                        onClick={() => onRecipientRemove(recipient.id, "cc")}
                        className="ml-1 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!sender && recipients.to.length === 0 && recipients.cc.length === 0 && (
            <span className="text-sm text-gray-500 italic">No hay remitente ni destinatarios seleccionados</span>
          )}
        </div>
      </div>
    </div>
  )
}
