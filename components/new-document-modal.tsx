"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText } from "lucide-react"
import { apiClient } from "@/lib/api"

interface NewDocumentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewDocumentModal({ isOpen, onClose }: NewDocumentModalProps) {
  const [subject, setSubject] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleCreate = async () => {
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un asunto para el documento.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create document via API client (que usa la URL correcta)
      console.log("Creating document with subject:", subject.trim())
      const result = await apiClient.createDocument({
        subject: subject.trim(),
        tags: [],
      })

      console.log("Document creation result:", result)

      if (result.success && result.data?.documentId) {
        toast({
          title: "Documento creado",
          description: "El documento se ha creado exitosamente.",
          variant: "success",
        })

        // Close modal and reset form
        onClose()
        setSubject("")

        // Open document editor with the new documentId
        const documentId = result.data.documentId
        window.open(`/compose?documentId=${documentId}`, "_blank")
      } else {
        throw new Error(result.message || "Error al crear el documento")
      }
    } catch (error) {
      console.error("Error creating document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el documento. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setSubject("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Nuevo Documento
          </DialogTitle>
          <DialogDescription>Ingresa el asunto del documento que deseas crear.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Asunto
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ingresa el asunto del documento..."
              className="col-span-3"
              disabled={isCreating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreate()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !subject.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
