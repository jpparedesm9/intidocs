"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
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
import { ToastContainer } from "./toast"
import HorizontalRuler from "./horizontal-ruler"
import VerticalRuler from "./vertical-ruler"
import { useSearchParams } from "next/navigation"

// Dynamically import heavy components
const DocumentHeader = dynamic(() => import("./document-header"), { ssr: false })
const EnhancedToolbar = dynamic(() => import("./enhanced-toolbar"), { ssr: false })
const RecipientSearchPanel = dynamic(() => import("./recipient-search-panel"), { ssr: false })

export default function DocumentEditor() {
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
  const [isRecipientPanelOpen, setIsRecipientPanelOpen] = useState(false)
  const [recipients, setRecipients] = useState<{
    to: Array<{ id: string; name: string; email: string; institution?: string }>
    cc: Array<{ id: string; name: string; email: string; institution?: string }>
  }>({ to: [], cc: [] })
  const [sender, setSender] = useState<{ id: string; name: string; email: string; institution?: string } | null>(null)
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
        lastColumnResizable: true,
        cellMinWidth: 50,
        HTMLAttributes: {
          class: "border-collapse table-fixed w-full",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-gray-200",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-200 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-gray-100 font-bold border border-gray-200 p-2",
        },
      }),
      TableCellAttributes,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableCell", "tableHeader"],
      }),
      Placeholder.configure({
        placeholder: "Comienza a escribir tu documento...",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      FontSize,
      FontFamily,
      TextColor,
      Highlight,
      PageBreak,
    ],
    [],
  )

  // Create callback functions using useCallback to prevent recreations
  const handleKeydown = useCallback((view, event) => {
    try {
      // Default behavior
      return false
    } catch (error) {
      console.error("Error handling keydown:", error)
      setEditorError(`Error handling keydown: ${error instanceof Error ? error.message : String(error)}`)
      return true // Prevent default to avoid cascading errors
    }
  }, [])

  const handleTransaction = useCallback(() => {
    try {
      // Clear any previous errors when a successful transaction occurs
      if (editorError) {
        setEditorError(null)
      }
    } catch (error) {
      console.error("Error in onTransaction:", error)
    }
  }, [editorError])

  const handleError = useCallback((error) => {
    console.error("Editor error:", error)
    setEditorError(`Editor error: ${error instanceof Error ? error.message : String(error)}`)
  }, [])

  // Forward declarations to handle circular references
  const saveDocumentRef = useRef<(content?: any) => void>(() => {})
  const debouncedSaveRef = useRef<(content: any) => void>(() => {})

  // Create handleUpdate with references to avoid circular dependency
  const handleUpdate = useCallback(({ editor }) => {
    try {
      if (editor && editor.getJSON && debouncedSaveRef.current) {
        debouncedSaveRef.current(editor.getJSON())
      }
    } catch (error) {
      console.error("Error in onUpdate:", error)
      setEditorError(`Error updating content: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [])

  // Memoize editor configuration
  const editorConfig = useMemo(
    () => ({
      extensions: editorExtensions,
      content: "",
      editorProps: {
        attributes: {
          class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px]",
        },
        handleDOMEvents: {
          keydown: handleKeydown,
        },
      },
      onUpdate: handleUpdate,
      onTransaction: handleTransaction,
      onError: handleError,
      autofocus: false,
      editable: true,
    }),
    [editorExtensions, handleKeydown, handleUpdate, handleTransaction, handleError],
  )

  const editor = useEditor(editorConfig)

  // Save the current document - memoize with useCallback to avoid recreations
  const saveDocument = useCallback(
    (content: any = editor?.getJSON?.(), showToast = false) => {
      try {
        if (!documentId || !content) return

        setIsSaving(true)

        // Use a functional update to prevent stale closure issues
        setDocuments((prevDocuments) => {
          const updatedDocuments = [...prevDocuments]
          const existingDocIndex = updatedDocuments.findIndex((doc) => doc.id === documentId)

          if (existingDocIndex >= 0) {
            updatedDocuments[existingDocIndex] = {
              ...updatedDocuments[existingDocIndex],
              title: documentTitle,
              content,
            }
          } else {
            updatedDocuments.push({
              id: documentId,
              title: documentTitle,
              content,
            })
          }

          // Use a more efficient approach - only stringify once
          localStorage.setItem("documents", JSON.stringify(updatedDocuments))
          return updatedDocuments
        })

        // Use setTimeout to avoid blocking the main thread during save operations
        setTimeout(() => {
          setIsSaving(false)

          // Only show toast notification if explicitly requested (when Save button is clicked)
          if (showToast) {
            toast({
              title: "Documento guardado",
              description: "Tu documento ha sido guardado correctamente.",
              variant: "success",
              duration: 5000, // 5 seconds duration
            })
          }
        }, 300)
      } catch (error) {
        console.error("Error saving document:", error)
        setEditorError(`Error saving document: ${error instanceof Error ? error.message : String(error)}`)
        setIsSaving(false)

        // Always show error toast
        toast({
          title: "Error al guardar",
          description: "Hubo un problema al guardar tu documento.",
          variant: "destructive",
          duration: 5000, // 5 seconds duration
        })
      }
    },
    [documentId, documentTitle, toast, editor],
  )

  // Update the ref
  useEffect(() => {
    saveDocumentRef.current = saveDocument
  }, [saveDocument])

  // Create the debounced save function
  const debouncedSaveFunc = useCallback(
    (content: any) => {
      try {
        if (documentId && saveDocumentRef.current) {
          saveDocumentRef.current(content)
        }
      } catch (error) {
        console.error("Error in debouncedSave:", error)
        setEditorError(`Error saving document: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    [documentId],
  )

  // Use the useDebounce hook directly - hooks can only be used at the top level
  const debouncedSave = useDebounce(debouncedSaveFunc, 2000)

  // Update the ref
  useEffect(() => {
    debouncedSaveRef.current = debouncedSave
  }, [debouncedSave])

  // Handle scroll events to update ruler positions with debouncing
  useEffect(() => {
    const handleScroll = () => {
      if (editorContainerRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          setScrollPosition({
            x: editorContainerRef.current?.scrollLeft || 0,
            y: editorContainerRef.current?.scrollTop || 0,
          })
        })
      }
    }

    const editorContainer = editorContainerRef.current
    if (editorContainer) {
      editorContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (editorContainer) {
        editorContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Load documents from local storage on mount
  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem("documents")
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments))
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setEditorError(`Error loading documents: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [])

  // Create a new document - memoize with useCallback
  const createNewDocument = useCallback(() => {
    try {
      const id = generateId()
      setDocumentId(id)
      setDocumentTitle("Untitled Document")
      if (editor && editor.commands) {
        editor.commands.clearContent()
      }
      toast({
        title: "New document created",
        variant: "success",
      })
    } catch (error) {
      console.error("Error creating new document:", error)
      setEditorError(`Error creating new document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor, toast])

  // Load document from API
  const loadDocumentFromAPI = async (documentId: string) => {
    setIsLoadingDocument(true)
    try {
      const response = await fetch(`/api/documents/${documentId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        const docData = result.data
        setDocumentData(docData)
        setDocumentTitle(docData.subject || "Untitled Document")
        setDocumentId(documentId)

        // Set content in editor
        if (editor && docData.body) {
          editor.commands.setContent(docData.body)
        }

        toast({
          title: "Documento cargado",
          description: `"${docData.subject}" se ha cargado correctamente.`,
          variant: "success",
        })
      } else {
        throw new Error(result.message || "Error al cargar el documento")
      }
    } catch (error) {
      console.error("Error loading document:", error)
      toast({
        title: "Error al cargar",
        description: "No se pudo cargar el documento. Creando uno nuevo.",
        variant: "destructive",
      })
      // Fallback to creating new document
      createNewDocument()
    } finally {
      setIsLoadingDocument(false)
    }
  }

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

  // Load document from URL parameter or create new one
  useEffect(() => {
    try {
      if (editor) {
        const documentIdFromURL = searchParams.get("documentId")

        if (documentIdFromURL && !documentId) {
          // Load existing document
          loadDocumentFromAPI(documentIdFromURL)
        } else if (!documentId) {
          // Create new document
          createNewDocument()
        }
      }
    } catch (error) {
      console.error("Error in document initialization:", error)
      setEditorError(`Error initializing document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor, documentId, searchParams, createNewDocument])

  // Ensure editor is focused and editable
  useEffect(() => {
    try {
      if (editor && editor.setEditable && editor.commands) {
        editor.setEditable(true)
        setTimeout(() => {
          if (editor.commands.focus) {
            editor.commands.focus()
          }
        }, 100)
      }
    } catch (error) {
      console.error("Error focusing editor:", error)
      setEditorError(`Error focusing editor: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor])

  // Add print styles
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
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
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Handle recipient selection
  const handleRecipientSelect = useCallback(
    (recipient: any, type: "to" | "cc") => {
      setRecipients((prev) => ({
        ...prev,
        [type]: [...prev[type], recipient],
      }))
      toast({
        title: "Destinatario añadido",
        description: `${recipient.name} añadido como ${type === "to" ? "destinatario principal" : "copia"}`,
        variant: "success",
      })
    },
    [toast],
  )

  // Remove recipient
  const handleRecipientRemove = useCallback((recipientId: string, type: "to" | "cc") => {
    setRecipients((prev) => ({
      ...prev,
      [type]: prev[type].filter((r) => r.id !== recipientId),
    }))
  }, [])

  // Handle sender selection
  const handleSenderSelect = useCallback(
    (selectedSender: any) => {
      setSender(selectedSender)
      if (selectedSender) {
        toast({
          title: "Remitente seleccionado",
          description: `${selectedSender.name} seleccionado como remitente`,
          variant: "success",
        })
      }
    },
    [toast],
  )

  // Remove sender
  const handleSenderRemove = useCallback(() => {
    setSender(null)
  }, [])

  // Memoize document container click handler - must be defined before any conditional returns
  const handleDocumentContainerClick = useCallback(() => {
    try {
      if (editor && editor.commands && editor.commands.focus) {
        editor.commands.focus()
      }
    } catch (error) {
      console.error("Error focusing editor:", error)
      setEditorError(`Error focusing editor: ${error instanceof Error ? error.message : String(error)}`)
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
      ),
    [],
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
      <div className="flex flex-col h-screen bg-[#f1f3f4]">
        {editorError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
            <strong>Error:</strong> {editorError}
            <button className="ml-2 text-red-700 hover:text-red-900" onClick={() => setEditorError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {/* Document Header with Recipients and Sender */}
        <DocumentHeader
          title={documentTitle}
          setTitle={setDocumentTitle}
          onSave={() => saveDocument(editor?.getJSON?.(), true)}
          documents={documents}
          onLoad={loadDocument}
          isSaving={isSaving}
          recipients={recipients}
          sender={sender}
          onRecipientRemove={handleRecipientRemove}
          onSenderRemove={handleSenderRemove}
          onOpenRecipientSearch={() => setIsRecipientPanelOpen(true)}
        />

        {/* Enhanced Toolbar */}
        <EnhancedToolbar editor={editor} />

        {/* Horizontal ruler */}
        <HorizontalRuler scrollLeft={scrollPosition.x} />

        {/* Main content area with document and rulers */}
        <div className="flex-1 overflow-hidden">
          <div className="relative h-full">
            {/* Document container with vertical ruler */}
            <div ref={editorContainerRef} className="absolute inset-0 overflow-auto">
              <div className="flex min-h-full">
                {/* Vertical ruler */}
                <VerticalRuler scrollTop={scrollPosition.y} />

                {/* Document content area with centered page */}
                <div className="flex-1 py-4 flex justify-center">
                  <div className={pageContainerClasses} onClick={handleDocumentContainerClick}>
                    <EditorContent editor={editor} className="page-content p-[1in]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Search Panel */}
        <RecipientSearchPanel
          isOpen={isRecipientPanelOpen}
          onClose={() => setIsRecipientPanelOpen(false)}
          onRecipientSelect={handleRecipientSelect}
          onSenderSelect={handleSenderSelect}
          existingRecipients={[...recipients.to, ...recipients.cc]}
          currentSender={sender}
        />

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </div>
    </ErrorBoundary>
  )
}
