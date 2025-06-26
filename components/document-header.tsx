"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Users, Paperclip, X, User, Send, Eye, Search, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SearchRecipientsModal from "./search-recipients-modal"

interface DocumentHeaderProps {
  title: string
  setTitle: (title: string) => void
  onSave: () => void
  documents: Array<{ id: string; title: string; content: any }>
  onLoad: (id: string) => void
  isSaving: boolean
  recipients?: {
    to: Array<{ id: string; name: string; email: string; institution?: string; position?: string }>
    cc: Array<{ id: string; name: string; email: string; institution?: string; position?: string }>
  }
  sender?: { id: string; name: string; email: string; institution?: string; position?: string } | null
  attachments?: Array<{ id: string; name: string; size: number; type: string }>
  onRecipientRemove?: (id: string, type: "to" | "cc") => void
  onSenderRemove?: () => void
  onOpenRecipientSearch?: () => void
  onOpenAttachmentManager?: () => void
  onOpenPreview?: () => void
  isExpanded?: boolean
}

export default function DocumentHeader({
  title,
  setTitle,
  onSave,
  documents,
  onLoad,
  isSaving,
  recipients,
  sender,
  attachments = [],
  onRecipientRemove,
  onSenderRemove,
  onOpenRecipientSearch,
  onOpenAttachmentManager,
  onOpenPreview,
  isExpanded = true,
}: DocumentHeaderProps) {
  const [documentType, setDocumentType] = useState("memo")
  const [priority, setPriority] = useState("normal")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isTableExpanded, setIsTableExpanded] = useState(true)
  const [subject, setSubject] = useState(title || "")
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Estado para controlar el modal de búsqueda de usuarios
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false)
  
  const toggleTable = useCallback(() => {
    setIsTableExpanded(prev => !prev)
  }, [])

  // Handle title editing
  const startEditingTitle = useCallback(() => {
    setIsEditingTitle(true)
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus()
        titleInputRef.current.select()
      }
    }, 0)
  }, [])

  const finishEditingTitle = useCallback(() => {
    setIsEditingTitle(false)
  }, [])
  
  // Update subject when title changes from parent
  useEffect(() => {
    if (title && title !== subject) {
      setSubject(title)
    }
  }, [title])

  // Handle keyboard events for title input
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        finishEditingTitle()
      } else if (e.key === "Escape") {
        finishEditingTitle()
      }
    },
    [finishEditingTitle],
  )

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  console.log("📋 document-header recibió datos:", { sender, recipients })

  return (
    <div 
      className="document-header bg-white border-b border-gray-200 px-4 py-2" 
      style={{ position: 'relative', zIndex: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        {/* Action Buttons - Siempre visibles */}
        <div className="flex items-center space-x-2">
          {/* Buscar De/Para (renamed from Recipients) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Si tenemos un callback, usar ese
              if (onOpenRecipientSearch) {
                console.log("🔍 Abriendo modal de búsqueda mediante callback del padre")
                onOpenRecipientSearch()
              } else {
                // Caso de fallback - usar modal local
                console.log("🔍 Abriendo modal de búsqueda local")
                setIsUserSearchModalOpen(true)
              }
            }}
            className="h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black"
            title="Buscar remitentes y destinatarios"
          >
            <Search className="h-4 w-4 text-black" />
            Buscar De/Para
            {recipients && recipients.to.length + recipients.cc.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-gray-400 text-black">
                {recipients.to.length + recipients.cc.length}
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

          {/* Enviar button (new) */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-gray-200 border-gray-400 hover:bg-gray-300 hover:border-gray-500 text-black"
            title="Enviar documento"
          >
            <Send className="h-4 w-4 text-black" />
            Enviar
          </Button>

          {/* Attachments button - moved as hidden or with display:none */}
          <div className="hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAttachmentManager}
              className="h-9 gap-2"
              title="Gestionar adjuntos"
            >
              <Paperclip className="h-4 w-4" />
              Adjuntos
              {attachments.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {attachments.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Right side - empty since we removed the title */}
        <div className="flex items-center space-x-2">
          {/* Hidden title field for future reference */}
          <div className="hidden">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={finishEditingTitle}
                onKeyDown={handleTitleKeyDown}
                className="h-8 text-lg font-medium w-[300px]"
                autoFocus
              />
            ) : (
              <h1
                className="text-lg font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                onClick={startEditingTitle}
              >
                {title}
              </h1>
            )}
          </div>
        </div>
      </div>

      {/* Document metadata - Only visible when expanded */}
      {isExpanded && (
        <div 
          className="flex items-center text-sm text-gray-600 mt-2"
          style={{ position: 'relative', zIndex: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center mr-4">
          <span className="mr-2">Tipo de Documento:</span>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="h-7 w-[180px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={5}>
              <SelectItem value="memo">Memorando</SelectItem>
              <SelectItem value="letter">Carta</SelectItem>
              <SelectItem value="report">Informe</SelectItem>
              <SelectItem value="contract">Contrato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center mr-4">
          <span className="mr-2">Prioridad:</span>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-7 w-[180px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-300">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={5}>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      )}
      
      {/* Tabla de destinatarios con botón de colapsar - Only visible when expanded */}
      {isExpanded && (
        <div className="mt-3 px-2">
        <div className="flex items-center justify-between mb-1">
          <button 
            onClick={toggleTable}
            className="flex items-center text-sm text-gray-700 hover:text-black focus:outline-none bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 transition-colors duration-200 shadow-sm"
          >
            {isTableExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">Destinatarios</span>
            <span className="ml-2 text-xs text-gray-500">
              {isTableExpanded ? "Contraer" : "Expandir"}
            </span>
          </button>
        </div>
        
        <div 
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isTableExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <table className="w-full border-collapse text-xs border-2 border-gray-400">
            <thead>
              <tr>
                <th className="p-1 text-left w-1/6 bg-transparent"></th>
                <th className="bg-gray-300 p-1 text-left font-medium">Nombre</th>
                <th className="bg-gray-300 p-1 text-left font-medium">Título</th>
                <th className="bg-gray-300 p-1 text-left font-medium">Posición</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {/* Remitente (De) */}
              {sender ? (
                <tr>
                  <td className="p-1 font-medium text-left">De:</td>
                  <td className="p-1">{sender.name}</td>
                  <td className="p-1">
                    {/* Título - Podríamos obtenerlo de datos extendidos si es necesario */}
                    {sender.position || ""}
                  </td>
                  <td className="p-1">{sender.institution || ""}</td>
                </tr>
              ) : (
                <tr>
                  <td className="p-1 font-medium text-left">De:</td>
                  <td colSpan={3} className="p-1 text-gray-400 italic">
                    No se ha seleccionado remitente
                  </td>
                </tr>
              )}
              
              {/* Destinatarios principales (Para) */}
              {recipients && recipients.to.length > 0 ? (
                recipients.to.map((recipient, index) => (
                  <tr key={`to-${recipient.id}`}>
                    <td className="p-1 font-medium text-left">
                      {index === 0 ? "Para:" : ""}
                    </td>
                    <td className="p-1">{recipient.name}</td>
                    <td className="p-1">
                      {/* Título - Podríamos obtenerlo de datos extendidos si es necesario */}
                      {recipient.position || ""}
                    </td>
                    <td className="p-1">{recipient.institution || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-1 font-medium text-left">Para:</td>
                  <td colSpan={3} className="p-1 text-gray-400 italic">
                    No se han seleccionado destinatarios
                  </td>
                </tr>
              )}
              
              {/* Destinatarios en copia (CC) */}
              {recipients && recipients.cc.length > 0 ? (
                recipients.cc.map((recipient, index) => (
                  <tr key={`cc-${recipient.id}`}>
                    <td className="p-1 font-medium text-left">
                      {index === 0 ? "Copia a:" : ""}
                    </td>
                    <td className="p-1">{recipient.name}</td>
                    <td className="p-1">
                      {/* Título - Podríamos obtenerlo de datos extendidos si es necesario */}
                      {recipient.position || ""}
                    </td>
                    <td className="p-1">{recipient.institution || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-1 font-medium text-left">Copia a:</td>
                  <td colSpan={3} className="p-1 text-gray-400 italic">
                    No se han seleccionado destinatarios en copia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Campo de Asunto */}
        <div className="mt-3 flex items-center">
          <label htmlFor="subject" className="font-medium text-gray-700 text-sm w-[60px]">Asunto:</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setTitle(e.target.value);
            }}
            className="flex-1 h-8 text-sm border border-gray-300 rounded px-2 focus:outline-none"
            placeholder="Ingrese el asunto del documento"
          />
        </div>
      </div>
      )}

      {/* Original Recipients and Sender display - Hidden */}
      <div className="hidden">
        {((recipients && (recipients.to.length > 0 || recipients.cc.length > 0)) || sender) && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm flex-wrap gap-x-4">
              {/* Sender */}
              {sender && (
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">De:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                          <User className="h-3 w-3 mr-1 text-blue-500" />
                          <span className="mr-1 text-blue-700">{sender.name}</span>
                          {onSenderRemove && (
                            <button
                              onClick={onSenderRemove}
                              className="text-blue-400 hover:text-blue-600"
                              aria-label="Remove sender"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{sender.email}</p>
                        {sender.institution && <p>{sender.institution}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {/* To recipients */}
              {recipients && recipients.to.length > 0 && (
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Para:</span>
                  <div className="flex flex-wrap gap-1">
                    {recipients.to.map((recipient) => (
                      <TooltipProvider key={recipient.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                              <span className="mr-1 text-green-700">{recipient.name}</span>
                              {onRecipientRemove && (
                                <button
                                  onClick={() => onRecipientRemove(recipient.id, "to")}
                                  className="text-green-400 hover:text-green-600"
                                  aria-label="Remove recipient"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{recipient.email}</p>
                            {recipient.institution && <p>{recipient.institution}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* CC recipients */}
              {recipients && recipients.cc.length > 0 && (
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">CC:</span>
                  <div className="flex flex-wrap gap-1">
                    {recipients.cc.map((recipient) => (
                      <TooltipProvider key={recipient.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                              <span className="mr-1 text-amber-700">{recipient.name}</span>
                              {onRecipientRemove && (
                                <button
                                  onClick={() => onRecipientRemove(recipient.id, "cc")}
                                  className="text-amber-400 hover:text-amber-600"
                                  aria-label="Remove cc recipient"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{recipient.email}</p>
                            {recipient.institution && <p>{recipient.institution}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments summary */}
            {attachments.length > 0 && (
              <div className="flex items-center text-sm mt-1">
                <span className="text-gray-600 mr-2">Adjuntos:</span>
                <div className="flex flex-wrap gap-1">
                  {attachments.slice(0, 3).map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 text-purple-700"
                    >
                      <span className="mr-1">
                        {attachment.name} ({formatFileSize(attachment.size)})
                      </span>
                    </div>
                  ))}
                  {attachments.length > 3 && (
                    <div className="flex items-center bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 text-purple-700">
                      <span>+{attachments.length - 3} más</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de búsqueda de remitentes y destinatarios - Solo llamar a onOpenRecipientSearch para usar un solo modal */}
      {onOpenRecipientSearch ? null : (
        <SearchRecipientsModal 
          isOpen={isUserSearchModalOpen}
          onClose={() => {
            console.log("Closing modal from DocumentHeader");
            setIsUserSearchModalOpen(false);
          }}
          onRecipientSelect={
            (recipient, type) => {
              console.log("Seleccionado destinatario:", recipient, type);
              // No usar el modal local si tenemos un callback del padre
              console.log("⚠️ Este SearchRecipientsModal no debería usarse. Usar el modal del document-editor")
            }
          }
          onSenderSelect={
            (newSender) => {
              console.log("Seleccionado remitente:", newSender);
              // No usar el modal local si tenemos un callback del padre
              console.log("⚠️ Este SearchRecipientsModal no debería usarse. Usar el modal del document-editor")
            }
          }
          existingRecipients={recipients ? [
            // Destinatarios principales con tipo "to"
            ...recipients.to.map(recipient => ({
              ...recipient,
              type: "to"
            })),
            // Destinatarios en copia con tipo "cc"
            ...recipients.cc.map(recipient => ({
              ...recipient,
              type: "cc"
            }))
          ] : []}
          currentSender={sender}
        />
      )}
    </div>
  )
}
