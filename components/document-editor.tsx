"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { createPortal } from "react-dom"
import StarterKit from "@tiptap/starter-kit"
import TextStyle from "@tiptap/extension-text-style"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import { PageBreak } from "@/extensions/page-break"
import { TableCellAttributes } from "@/extensions/table-cell-attributes"
import { FontSize } from "@/extensions/font-size"
import { FontFamily } from "@/extensions/font-family"
import { TextColor } from "@/extensions/text-color"
import { Highlight } from "@/extensions/highlight"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { generateId } from "@/lib/utils"
import ErrorBoundary from "./error-boundary"
import { useToast } from "@/hooks/use-toast"
import HorizontalRuler from "./horizontal-ruler"
import VerticalRuler from "./vertical-ruler"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import DocumentHeaderExpanded from "./document-header-expanded"

// Dynamically import heavy components with explicit loading options
const DocumentHeader = dynamic(() => import("./document-header"), { 
  ssr: false,
  loading: () => <div className="bg-white border-b border-gray-200 px-4 py-2">Cargando encabezado...</div>
})
const EnhancedToolbar = dynamic(() => import("./enhanced-toolbar"), { 
  ssr: false,
  loading: () => <div className="border-b border-gray-200 bg-white p-1">Cargando herramientas...</div>
})
const SearchRecipientsModal = dynamic(() => import("./search-recipients-modal"), { ssr: false })
const AttachmentManager = dynamic(() => import("./attachment-manager"), { ssr: false })

interface AttachmentFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
  status: "uploading" | "completed" | "error"
}

interface DocumentEditorProps {
  initialDocumentId?: string | null
  sidebarCollapsed?: boolean
}

export default function DocumentEditor({ initialDocumentId, sidebarCollapsed = false }: DocumentEditorProps = {}) {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document")
  const [documentId, setDocumentId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [documents, setDocuments] = useState<Array<{ id: string; title: string; content: any }>>([])
  const [editorError, setEditorError] = useState<string | null>(null)
  const { toast, dismiss, toasts } = useToast()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [documentData, setDocumentData] = useState(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [isAttachmentManagerOpen, setIsAttachmentManagerOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [pdfLoadError, setPdfLoadError] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const [isExpanded, setIsExpanded] = useState(true)
  const [portalMounted, setPortalMounted] = useState(false)
  const [recipients, setRecipients] = useState<{
    to: Array<{ id: string; name: string; email: string; institution?: string; position?: string }>
    cc: Array<{ id: string; name: string; email: string; institution?: string; position?: string }>
  }>({ to: [], cc: [] })
  const [sender, setSender] = useState<{ id: string; name: string; email: string; institution?: string; position?: string } | null>(null)
  const searchParams = useSearchParams()

  // Initialize editor with extensions - memoize configuration
  const editorExtensions = useMemo(
    () => [
      StarterKit,
      TextStyle,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TableCellAttributes,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        defaultAlignment: "left",
      }),
      Placeholder.configure({
        placeholder: "Comienza a escribir aquí...",
      }),
      Link,
      PageBreak,
      FontSize,
      FontFamily,
      TextColor,
      Highlight,
    ],
    []
  )

  // Inicializar editor usando useEditor
  const editor = useEditor({
    extensions: editorExtensions,
    content: '<p style="font-size: 12px;">Contenido inicial del documento...</p>',
    editable: true,
    // Usar onUpdate para debounce para guardar automáticamente
    onUpdate: ({ editor }) => {
      console.log('Document changed')
    },
    onSelectionUpdate: ({ editor }) => {
      // Lógica cuando cambia la selección
    },
    onTransaction: ({ editor, transaction }) => {
      // Puedes agregar analíticas o procesamiento adicional aquí
    },
    onFocus: ({ editor, event }) => {
      console.log('Editor focused')
    },
    onBlur: ({ editor, event }) => {
      console.log('Editor blurred')
    },
  })

  // Actualizar posición de scroll para las reglas
  useEffect(() => {
    const updateScrollPosition = () => {
      if (editorContainerRef.current) {
        setScrollPosition({
          x: editorContainerRef.current.scrollLeft,
          y: editorContainerRef.current.scrollTop,
        })
      }
    }

    const editorContainer = editorContainerRef.current
    if (editorContainer) {
      editorContainer.addEventListener("scroll", updateScrollPosition)
      return () => editorContainer.removeEventListener("scroll", updateScrollPosition)
    }
  }, [])

  // Función para guardar documento
  const saveDocument = useCallback(
    async (content: any = null, notify: boolean = false) => {
      try {
        setIsSaving(true)
        
        // Get JSON content from editor if not provided
        const documentContent = content || editor?.getJSON?.()
        
        if (!documentContent) {
          console.error("No content to save")
          toast({
            title: "Save failed",
            description: "No content to save",
            variant: "destructive",
          })
          return
        }
        
        // For now, simulate saving to localStorage
        // In a real app, you'd save to a backend server
        const savedDoc = {
          id: documentId || generateId(),
          title: documentTitle,
          content: documentContent,
          savedAt: new Date().toISOString(),
        }
        
        // Update or add to documents list
        setDocuments((prev) => {
          const existing = prev.findIndex((doc) => doc.id === savedDoc.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = savedDoc
            return updated
          }
          return [...prev, savedDoc]
        })
        
        // Update current document ID
        if (!documentId) {
          setDocumentId(savedDoc.id)
        }
        
        // Success notification
        if (notify) {
          toast({
            title: "Document saved",
            description: `"${documentTitle}" has been saved.`,
            variant: "success",
          })
        }
        
        console.log("Document saved:", savedDoc)
        return savedDoc
      } catch (error) {
        console.error("Error saving document:", error)
        setEditorError(`Error saving: ${error instanceof Error ? error.message : String(error)}`)
        toast({
          title: "Save failed",
          description: "There was a problem saving your document.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    },
    [documentId, documentTitle, editor, toast]
  )

  // Utilidad para debounce de autoguardado
  const debouncedSave = useDebounce(saveDocument, 2000)

  // Handler for preview
  const handleOpenPreview = useCallback(() => {
    setIsPreviewModalOpen(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setIsPreviewModalOpen(false)
  }, [])

  // Memoize creating new document function
  const createNewDocument = useCallback(() => {
    try {
      const newDoc = {
        id: generateId(),
        title: "Untitled Document",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Comienza a escribir aquí...",
                  marks: [
                    {
                      type: "textStyle",
                      attrs: {
                        fontSize: "12px"
                      }
                    }
                  ]
                },
              ],
            },
          ],
        },
      }
      
      setDocumentId(newDoc.id)
      setDocumentTitle(newDoc.title)
      
      if (editor && editor.commands) {
        editor.commands.setContent(newDoc.content)
      }
      
      setDocuments((prev) => [...prev, newDoc])
      
      toast({
        title: "New document created",
        description: "You can now start editing your document.",
        variant: "success",
      })
      
      return newDoc
    } catch (error) {
      console.error("Error creating document:", error)
      setEditorError(`Error creating document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor, toast])

  // Memoize load document from API function
  const loadDocumentFromAPI = useCallback(
    async (id: string) => {
      try {
        console.log(`Loading document with ID: ${id}`)
        setIsLoadingDocument(true)
        
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        // Check if we already have the document locally
        const existingDoc = documents.find((doc) => doc.id === id)
        
        if (existingDoc) {
          setDocumentId(existingDoc.id)
          setDocumentTitle(existingDoc.title)
          if (editor && editor.commands) {
            editor.commands.setContent(existingDoc.content)
          }
          toast({
            title: "Document loaded",
            description: `"${existingDoc.title}" has been loaded.`,
            variant: "success",
          })
          return existingDoc
        }
        
        // In a real app, you'd fetch from API here
        // const response = await fetch(`/api/documents/${id}`)
        // const data = await response.json()
        
        // For now, just create a new doc as fallback
        throw new Error("Document not found locally")
      } catch (error) {
        console.error("Error loading document:", error)
        
        // Fallback to creating new document
        createNewDocument()
      } finally {
        setIsLoadingDocument(false)
      }
    },
    [documents, editor, toast, createNewDocument]
  )

  // Memoize load document function
  const loadDocument = useCallback(
    (id: string) => {
      try {
        const doc = documents.find((doc) => doc.id === id)
        if (doc && editor && editor.commands) {
          setDocumentId(doc.id)
          setDocumentTitle(doc.title)
          editor.commands.setContent(doc.content)
          toast({
            title: "Document loaded",
            description: `"${doc.title}" has been loaded.`,
            variant: "success",
          })
        }
      } catch (error) {
        console.error("Error loading document:", error)
        setEditorError(`Error loading document: ${error instanceof Error ? error.message : String(error)}`)
        toast({
          title: "Load failed",
          description: "There was a problem loading your document.",
          variant: "destructive",
        })
      }
    },
    [documents, editor, toast],
  )

  // Load document from initialDocumentId, URL parameter, or create new one
  useEffect(() => {
    try {
      if (editor) {
        // Usar initialDocumentId si está presente, si no, buscar en URL
        const documentIdToLoad = initialDocumentId || searchParams.get("documentId")

        if (documentIdToLoad && !documentId) {
          // Load existing document
          loadDocumentFromAPI(documentIdToLoad)
        } else if (!documentId) {
          // Create new document
          createNewDocument()
        }
      }
    } catch (error) {
      console.error("Error in document initialization:", error)
      setEditorError(`Error initializing document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor, documentId, searchParams, createNewDocument, initialDocumentId])

  // Simplificado: Manejo de enfoque del editor y configuración inicial
  useEffect(() => {
    try {
      if (editor && editor.setEditable) {
        // Hacer el editor editable
        editor.setEditable(true)
        
        // Establecer tamaño de fuente predeterminado
        if (editor.commands && editor.commands.setFontSize) {
          editor.commands.setFontSize('12px')
        }
        
        // Enfocar el editor al inicializarse con un retraso para asegurar que el DOM esté listo
        if (editor.commands && editor.commands.focus) {
          setTimeout(() => {
            editor.commands.focus('end')
          }, 200)
        }
      }
    } catch (error) {
      console.error("Error initializing editor:", error)
      setEditorError(`Error initializing editor: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor])

  // Efecto para gestionar el montaje del portal
  useEffect(() => {
    setPortalMounted(true)
    return () => setPortalMounted(false)
  }, [])

  // Add print styles and expanded mode styles
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const style = document.createElement("style")
    style.innerHTML = `
      /* Default font size for editor content */
      .ProseMirror {
        font-size: 12px;
      }
      
      /* Ensure paragraphs have default font size too */
      .ProseMirror p {
        font-size: 12px;
      }
      
      @media print {
        body * {
          visibility: hidden;
        }
        .page-container, .page-container * {
          visibility: visible;
        }
        .page-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          box-shadow: none !important;
          border: none !important;
        }
        .horizontal-ruler-container, 
        .vertical-ruler {
          display: none !important;
        }
        .page-break {
          page-break-after: always;
          visibility: hidden;
          height: 0;
        }
        .page-break::before {
          content: none;
        }
        .horizontal-rule,
        hr {
          border-top: 1px solid #000;
          margin: 1em 0;
        }
      }
      
      /* Expanded editor styles */
      .expanded-editor {
        background-color: #f1f3f4 !important; /* Mantener el mismo color de fondo */
      }
      
      .expanded-editor .page-container {
        min-height: calc(100vh - 100px); /* Adjust for toolbar */
        margin: 15px auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra más pronunciada */
        width: 816px !important; /* Mantener el ancho fijo de carta US */
        max-width: 90% !important; /* Con un límite máximo por si la pantalla es pequeña */
      }
      
      .expanded-editor .ProseMirror {
        min-height: calc(100vh - 150px); /* Adjust for toolbar and padding */
      }
      
      .expanded-editor .flex-1.py-4.flex.justify-center.w-full {
        padding-top: 10px !important;
        padding-bottom: 20px !important;
      }
      
      /* Estilos para las reglas en modo expandido - mantener colores claros */
      .expanded-editor .horizontal-ruler-container {
        background-color: #f1f3f4;
        border-color: #e0e0e0;
      }
      
      .expanded-editor .vertical-ruler {
        background-color: #f1f3f4;
        border-color: #e0e0e0;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Manejar cambios en adjuntos
  const handleAttachmentsChange = useCallback((newAttachments: AttachmentFile[]) => {
    setAttachments(newAttachments)
  }, [])

  // Manejar selección de remitentes
  const [isSearchRecipientsModalOpen, setIsSearchRecipientsModalOpen] = useState(false)

  // Handler para abrir modal de búsqueda de destinatarios
  const handleOpenSearchRecipientsModal = useCallback(() => {
    console.log("Opening search recipients modal")
    setIsSearchRecipientsModalOpen(true)
  }, [])

  // Handler para cerrar modal de búsqueda de destinatarios
  const handleCloseSearchRecipientsModal = useCallback(() => {
    setIsSearchRecipientsModalOpen(false)
  }, [])
  
  // Handler para cuando se selecciona un destinatario
  const handleRecipientSelect = useCallback((
    recipient: any | null,
    type: "to" | "cc",
    recipientId?: string
  ) => {
    console.log(`Recipient ${recipientId || 'new'} selected as ${type}:`, recipient)
    
    setRecipients(prev => {
      // Si recipient es null, estamos eliminando un destinatario existente
      if (recipient === null && recipientId) {
        return {
          ...prev,
          [type]: prev[type].filter(r => r.id !== recipientId)
        }
      }
      
      // Si el destinatario ya está en la lista, no hacer nada
      if (prev[type].some(r => r.id === recipient.id)) {
        return prev
      }
      
      // Agregar nuevo destinatario
      return {
        ...prev,
        [type]: [...prev[type], recipient]
      }
    })
  }, [])
  
  // Handler para remover un destinatario
  const handleRecipientRemove = useCallback((id: string, type: "to" | "cc") => {
    setRecipients(prev => ({
      ...prev,
      [type]: prev[type].filter(r => r.id !== id)
    }))
  }, [])
  
  // Handler para cuando se selecciona un remitente
  const handleSenderSelect = useCallback((sender: any | null) => {
    setSender(sender)
  }, [])
  
  // Handler para eliminar remitente
  const handleSenderRemove = useCallback(() => {
    setSender(null)
  }, [])
  
  // Toggle expanded/contracted state
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Simplificado: Manejador de clics en el contenedor del documento 
  // Enfoca el editor cuando se hace clic en el área editable
  const handleDocumentContainerClick = useCallback((e) => {
    try {
      const target = e.target as HTMLElement;
      
      // Si el clic es directamente en el área de contenido editable o dentro de ella
      if (
        target.classList.contains('ProseMirror') || 
        (target.closest('.ProseMirror') && 
         !target.closest('button') &&
         !target.closest('select') &&
         !target.closest('input'))
      ) {
        if (editor && editor.commands && editor.commands.focus) {
          editor.commands.focus();
        }
      }
      
    } catch (error) {
      console.error("Error in document click handler:", error);
      setEditorError(`Error handling click: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [editor])

  // Optimize page container classes - must be defined before any conditional returns
  const pageContainerClasses = useMemo(
    () =>
      cn(
        "page-container relative bg-white",
        "w-[816px] min-h-[1056px]", // US Letter size in pixels (8.5" x 11")
        "border border-gray-200", // Lighter border
        "shadow-[0_1px_3px_rgba(60,64,67,0.15)]", // More subtle shadow like Google Docs
        "transition-all duration-300", // Smooth transition when sidebar collapses
        // Mantenemos el ancho fijo incluso en modo expandido para preservar el aspecto de papel
      ),
    [sidebarCollapsed], // Re-evaluate when sidebar state changes
  )

  if (!editor || isLoadingDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">{isLoadingDocument ? "Cargando documento..." : "Cargando editor..."}</div>
          {isLoadingDocument && <div className="text-sm text-gray-500">Obteniendo información del documento...</div>}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div 
           className={cn(
             "flex flex-col h-full w-full bg-[#f1f3f4] document-editor",
             isExpanded && "expanded-editor"
           )}
           style={{ 
             width: '100%', 
             height: '100%', 
             maxWidth: '100%', 
             overflow: 'hidden',
             position: 'relative',
             transition: 'all 0.3s ease'
           }}
         >
        {editorError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
            <strong>Error:</strong> {editorError}
            <button className="ml-2 text-red-700 hover:text-red-900" onClick={() => setEditorError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {/* DocumentHeader - Siempre visible, pero con contenido condicional */}
        <DocumentHeader
          title={documentTitle}
          setTitle={setDocumentTitle}
          onSave={() => saveDocument(editor?.getJSON?.(), true)}
          documents={documents}
          onLoad={loadDocument}
          isSaving={isSaving}
          recipients={recipients}
          sender={sender}
          attachments={attachments}
          onRecipientRemove={handleRecipientRemove}
          onSenderRemove={handleSenderRemove}
          onOpenRecipientSearch={handleOpenSearchRecipientsModal}
          onOpenAttachmentManager={() => setIsAttachmentManagerOpen(true)}
          onOpenPreview={handleOpenPreview}
          isExpanded={isExpanded}
        />

        {/* Enhanced Toolbar - Always visible */}
        <EnhancedToolbar
          editor={editor}
          onOpenAttachmentManager={() => setIsAttachmentManagerOpen(true)}
          attachmentCount={attachments.length}
          onOpenPreview={handleOpenPreview}
          isPreviewModalOpen={isPreviewModalOpen}
          onClosePreview={handleClosePreview}
          pdfLoadError={pdfLoadError}
          setPdfLoadError={setPdfLoadError}
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
        />

        {/* Horizontal ruler - Siempre visible */}
        <HorizontalRuler scrollLeft={scrollPosition.x} />

        {/* Main content area with document and rulers */}
        <div className="flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 15 }}>
          <div className="relative h-full">
            {/* Document container with vertical ruler */}
            <div 
              ref={editorContainerRef} 
              className="absolute inset-0 overflow-auto w-full h-full"
              style={{ position: 'relative', zIndex: 15 }}
            >
              <div className="flex min-h-full w-full">
                {/* Vertical ruler - Siempre visible */}
                <VerticalRuler scrollTop={scrollPosition.y} />

                {/* Document content area with centered page */}
                <div 
                  className={cn(
                    "flex-1 py-4 flex justify-center w-full"
                  )} 
                  style={{ 
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className={pageContainerClasses}>
                    <EditorContent 
                      editor={editor} 
                      className="page-content p-[1in]"
                      onClick={handleDocumentContainerClick}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Recipients Modal - New implementation */}
        {isSearchRecipientsModalOpen && portalMounted && typeof document !== 'undefined' && (
          <SearchRecipientsModal
            isOpen={isSearchRecipientsModalOpen}
            onClose={handleCloseSearchRecipientsModal}
            onRecipientSelect={handleRecipientSelect}
            onSenderSelect={handleSenderSelect}
            existingRecipients={[
              // Destinatarios principales con tipo "to"
              ...recipients.to.map(recipient => ({
                ...recipient,
                type: "to" as const
              })),
              // Destinatarios en copia con tipo "cc"
              ...recipients.cc.map(recipient => ({
                ...recipient,
                type: "cc" as const
              }))
            ]}
            currentSender={sender}
          />
        )}

        {/* Attachment Manager */}
        <AttachmentManager
          isOpen={isAttachmentManagerOpen}
          onClose={() => setIsAttachmentManagerOpen(false)}
          attachments={attachments}
          onAttachmentsChange={handleAttachmentsChange}
          maxFileSize={10}
          allowedTypes={[
            "image/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
          ]}
        />

        {/* Toast notifications manejadas por Toaster global */}
        
        {/* Preview Modal - Using React Portal for better stacking context */}
        {isPreviewModalOpen && portalMounted && typeof document !== 'undefined' && (
          createPortal(
            <div 
              className="fixed inset-0 flex items-center justify-center bg-black/80"
              style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 10000,
                isolation: 'isolate' // Crear un nuevo contexto de apilamiento
              }}
            >
              <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
                {/* Header with close button */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">Vista Previa del Documento</h2>
                  <button
                    onClick={handleClosePreview}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* PDF Content */}
                <div className="flex-1 p-4">
                  {pdfLoadError ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <AlertCircle className="h-16 w-16 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No se pudo cargar el PDF</h3>
                      <p className="text-sm text-center mb-4">
                        El documento de vista previa no está disponible en este momento.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPdfLoadError(false)
                          // Force iframe reload
                          const iframe = document.querySelector("#preview-iframe") as HTMLIFrameElement
                          if (iframe) {
                            iframe.src = iframe.src
                          }
                        }}
                      >
                        Intentar de nuevo
                      </Button>
                    </div>
                  ) : (
                    <iframe
                      id="preview-iframe"
                      src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
                      className="w-full h-full border rounded"
                      title="Vista Previa PDF"
                      onError={() => setPdfLoadError(true)}
                      onLoad={() => setPdfLoadError(false)}
                    />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        )}
      </div>
    </ErrorBoundary>
  )
}