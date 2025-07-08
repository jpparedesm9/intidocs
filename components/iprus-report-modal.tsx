"use client"

import { useState, useEffect, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextStyle from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { FontSize } from "@/extensions/font-size"
import { FontFamily } from "@/extensions/font-family"
import { TextColor } from "@/extensions/text-color"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, X, ArrowLeft, Send, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IprusReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IprusReportModal({ isOpen, onClose }: IprusReportModalProps) {
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const { toast } = useToast()

  // Initialize TipTap editor with basic formatting options
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontSize.configure(),
      FontFamily.configure(),
      TextColor.configure(),
    ],
    content: `
      <h2 style="text-align: center;">INFORME IPRUS</h2>
      <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Número de Trámite:</strong> TRIM-001</p>
      <p><strong>Solicitante:</strong> Carlos Vera</p>
      <hr />
      <h3>1. Antecedentes</h3>
      <p>Escribe aquí los antecedentes del informe...</p>
      <h3>2. Análisis</h3>
      <p>Escribe aquí el análisis correspondiente...</p>
      <h3>3. Conclusiones</h3>
      <p>Escribe aquí las conclusiones del informe...</p>
      <h3>4. Recomendaciones</h3>
      <p>Escribe aquí las recomendaciones...</p>
    `,
    autofocus: true,
    editable: true,
  })

  // Handle editor commands
  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run()
  const setTextAlign = (align: 'left' | 'center' | 'right') => editor?.chain().focus().setTextAlign(align).run()

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (editor) {
      // Here we would normally save the content
      console.log(editor.getHTML())
      // For this example, we'll just show the PDF preview
      setShowPdfPreview(true)
    }
  }, [editor])

  // Handle cancel button
  const handleCancel = useCallback(() => {
    setShowPdfPreview(false)
    onClose()
  }, [onClose])

  // Handle return to editor
  const handleReturn = useCallback(() => {
    setShowPdfPreview(false)
  }, [])

  // Handle send report
  const handleSendReport = useCallback(() => {
    toast({
      title: "Informe IPRUS enviado",
      description: "El informe ha sido enviado exitosamente.",
    })
    onClose()
  }, [toast, onClose])

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {showPdfPreview ? "Vista previa del Informe IPRUS" : "Elaborar Informe IPRUS"}
          </DialogTitle>
        </DialogHeader>

        {!showPdfPreview ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center p-1 space-x-1 border rounded-md mb-2 bg-gray-50">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleBold}
                className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleItalic}
                className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleUnderline}
                className={editor?.isActive('underline') ? 'bg-gray-200' : ''}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTextAlign('left')}
                className={editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTextAlign('center')}
                className={editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTextAlign('right')}
                className={editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            {/* TipTap Editor */}
            <div className="border rounded-md p-4 min-h-[250px] max-h-[350px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>

            {/* Editor Footer Buttons */}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" /> Enviar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* PDF Preview */}
            <div className="flex flex-col items-center justify-center">
              <iframe 
                src="https://www.urp.edu.pe/pdf/id/4392/n/formato-modelo-de-informe-final-de-investigacion-2.pdf" 
                className="w-full h-[350px] border rounded-md"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>

            {/* PDF Preview Footer Buttons */}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button variant="outline" onClick={handleReturn}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Regresar
              </Button>
              <Button onClick={handleSendReport}>
                <FileText className="h-4 w-4 mr-2" /> Enviar Informe
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}