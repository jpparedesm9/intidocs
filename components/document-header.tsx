"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Users, Paperclip, X, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DocumentHeaderProps {
  title: string
  setTitle: (title: string) => void
  onSave: () => void
  documents: Array<{ id: string; title: string; content: any }>
  onLoad: (id: string) => void
  isSaving: boolean
  recipients?: {
    to: Array<{ id: string; name: string; email: string; institution?: string }>
    cc: Array<{ id: string; name: string; email: string; institution?: string }>
  }
  sender?: { id: string; name: string; email: string; institution?: string } | null
  attachments?: Array<{ id: string; name: string; size: number; type: string }>
  onRecipientRemove?: (id: string, type: "to" | "cc") => void
  onSenderRemove?: () => void
  onOpenRecipientSearch?: () => void
  onOpenAttachmentManager?: () => void
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
}: DocumentHeaderProps) {
  const [documentType, setDocumentType] = useState("memo")
  const [priority, setPriority] = useState("normal")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Document title */}
        <div className="flex items-center">
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

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className={cn("h-8 gap-1", isSaving && "opacity-50 cursor-not-allowed")}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>

          {/* Recipients button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRecipientSearch}
            className="h-8 gap-1"
            title="Gestionar destinatarios"
          >
            <Users className="h-4 w-4" />
            Destinatarios
            {recipients && recipients.to.length + recipients.cc.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {recipients.to.length + recipients.cc.length}
              </Badge>
            )}
          </Button>

          {/* Attachments button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAttachmentManager}
            className="h-8 gap-1"
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

      {/* Document metadata */}
      <div className="flex items-center text-sm text-gray-600 mt-2">
        <div className="flex items-center mr-4">
          <span className="mr-2">Tipo de Documento:</span>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="h-7 w-[180px]">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
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
            <SelectTrigger className="h-7 w-[180px]">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipients and sender display */}
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
  )
}
