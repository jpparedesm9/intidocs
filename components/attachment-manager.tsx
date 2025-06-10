"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Paperclip, X, Upload, File, ImageIcon, FileText, Eye, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  status: "uploading" | "completed" | "error"
}

interface AttachmentManagerProps {
  isOpen: boolean
  onClose: () => void
  attachments: AttachmentFile[]
  onAttachmentsChange: (attachments: AttachmentFile[]) => void
  maxFileSize?: number // in MB
  allowedTypes?: string[]
}

export default function AttachmentManager({
  isOpen,
  onClose,
  attachments,
  onAttachmentsChange,
  maxFileSize = 10,
  allowedTypes = [
    "image/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
}: AttachmentManagerProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />
    if (type.includes("word") || type.includes("document")) return <FileText className="h-4 w-4 text-blue-500" />
    if (type.includes("excel") || type.includes("sheet")) return <FileText className="h-4 w-4 text-green-500" />
    return <File className="h-4 w-4" />
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `El archivo excede el tamaño máximo de ${maxFileSize}MB`
    }

    // Check file type
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isAllowed) {
      return "Tipo de archivo no permitido"
    }

    return null
  }

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const newAttachments: AttachmentFile[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const validationError = validateFile(file)

        if (validationError) {
          toast({
            title: "Error de archivo",
            description: `${file.name}: ${validationError}`,
            variant: "destructive",
          })
          continue
        }

        const attachmentId = `attachment-${Date.now()}-${i}`
        const newAttachment: AttachmentFile = {
          id: attachmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: "uploading",
        }

        newAttachments.push(newAttachment)

        // Simulate file upload with progress
        simulateUpload(newAttachment, file)
      }

      if (newAttachments.length > 0) {
        onAttachmentsChange([...attachments, ...newAttachments])
      }
    },
    [attachments, onAttachmentsChange, toast, maxFileSize, allowedTypes],
  )

  const simulateUpload = async (attachment: AttachmentFile, file: File) => {
    // Create object URL for preview
    const url = URL.createObjectURL(file)

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      onAttachmentsChange((prev) =>
        prev.map((att) =>
          att.id === attachment.id ? { ...att, uploadProgress: progress, url: progress === 100 ? url : att.url } : att,
        ),
      )
    }

    // Mark as completed
    onAttachmentsChange((prev) =>
      prev.map((att) => (att.id === attachment.id ? { ...att, status: "completed", uploadProgress: 100, url } : att)),
    )

    toast({
      title: "Archivo adjuntado",
      description: `${attachment.name} se ha adjuntado correctamente`,
      variant: "success",
    })
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const removeAttachment = (attachmentId: string) => {
    const attachment = attachments.find((att) => att.id === attachmentId)
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url)
    }

    onAttachmentsChange(attachments.filter((att) => att.id !== attachmentId))

    toast({
      title: "Archivo eliminado",
      description: "El archivo adjunto ha sido eliminado",
      variant: "default",
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Adjuntar Archivos
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
            <p className="text-sm text-gray-500 mb-4">Máximo {maxFileSize}MB por archivo</p>
            <Button onClick={openFileDialog} variant="outline">
              Seleccionar Archivos
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept={allowedTypes.join(",")}
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(e.target.files)
                }
              }}
            />
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-sm text-gray-700">Archivos Adjuntos ({attachments.length})</h4>

              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-shrink-0">{getFileIcon(attachment.type)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>

                    {attachment.status === "uploading" && (
                      <Progress value={attachment.uploadProgress || 0} className="h-1 mt-1" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Badge
                      variant={
                        attachment.status === "completed"
                          ? "default"
                          : attachment.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {attachment.status === "completed"
                        ? "Listo"
                        : attachment.status === "error"
                          ? "Error"
                          : "Subiendo..."}
                    </Badge>

                    {attachment.status === "completed" && attachment.url && (
                      <Button variant="ghost" size="sm" onClick={() => window.open(attachment.url, "_blank")}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File Type Info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Tipos de archivo permitidos:</p>
                <p>Imágenes, PDF, Word, Excel, archivos de texto</p>
                <p>Tamaño máximo: {maxFileSize}MB por archivo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
