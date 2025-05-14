"use client"

import { useState, useEffect, useRef } from "react"
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
import DocumentHeader from "./document-header"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { generateId } from "@/lib/utils"
import MainMenu from "./main-menu"
import EnhancedToolbar from "./enhanced-toolbar"
import ErrorBoundary from "./error-boundary"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "./toast"
import HorizontalRuler from "./horizontal-ruler"
import VerticalRuler from "./vertical-ruler"

export default function DocumentEditor() {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document")
  const [documentId, setDocumentId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [documents, setDocuments] = useState<Array<{ id: string; title: string; content: any }>>([])
  const [editorError, setEditorError] = useState<string | null>(null)
  const { toast, dismiss, toasts } = useToast()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  // Initialize editor with extensions
  const editor = useEditor({
    extensions: [
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
        placeholder: "Start typing...",
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
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px]",
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          try {
            // Default behavior
            return false
          } catch (error) {
            console.error("Error handling keydown:", error)
            setEditorError(`Error handling keydown: ${error instanceof Error ? error.message : String(error)}`)
            return true // Prevent default to avoid cascading errors
          }
        },
      },
    },
    onUpdate: ({ editor }) => {
      try {
        if (editor && editor.getJSON) {
          debouncedSave(editor.getJSON())
        }
      } catch (error) {
        console.error("Error in onUpdate:", error)
        setEditorError(`Error updating content: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    onTransaction: ({ transaction }) => {
      try {
        // Clear any previous errors when a successful transaction occurs
        if (editorError) {
          setEditorError(null)
        }
      } catch (error) {
        console.error("Error in onTransaction:", error)
      }
    },
    onError: (error) => {
      console.error("Editor error:", error)
      setEditorError(`Editor error: ${error instanceof Error ? error.message : String(error)}`)
    },
    autofocus: true,
    editable: true,
  })

  // Handle scroll events to update ruler positions
  useEffect(() => {
    const handleScroll = () => {
      if (editorContainerRef.current) {
        setScrollPosition({
          x: editorContainerRef.current.scrollLeft || 0,
          y: editorContainerRef.current.scrollTop || 0,
        })
      }
    }

    const editorContainer = editorContainerRef.current
    if (editorContainer) {
      editorContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (editorContainer) {
        editorContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Debounce save to avoid too many saves
  const debouncedSave = useDebounce((content: any) => {
    try {
      if (documentId) {
        saveDocument(content)
      }
    } catch (error) {
      console.error("Error in debouncedSave:", error)
      setEditorError(`Error saving document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, 1000)

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

  // Create a new document
  const createNewDocument = () => {
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
  }

  // Save the current document
  const saveDocument = (content: any = editor?.getJSON?.()) => {
    try {
      if (!documentId || !content) return

      setIsSaving(true)

      const updatedDocuments = [...documents]
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

      setDocuments(updatedDocuments)
      localStorage.setItem("documents", JSON.stringify(updatedDocuments))

      setTimeout(() => {
        setIsSaving(false)
        toast({
          title: "Document saved",
          description: "Your document has been saved successfully.",
          variant: "success",
        })
      }, 500)
    } catch (error) {
      console.error("Error saving document:", error)
      setEditorError(`Error saving document: ${error instanceof Error ? error.message : String(error)}`)
      setIsSaving(false)
      toast({
        title: "Save failed",
        description: "There was a problem saving your document.",
        variant: "destructive",
      })
    }
  }

  // Load a document
  const loadDocument = (id: string) => {
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
  }

  // Create a new document if none exists
  useEffect(() => {
    try {
      if (!documentId && editor) {
        createNewDocument()
      }
    } catch (error) {
      console.error("Error in document initialization:", error)
      setEditorError(`Error initializing document: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [editor, documentId])

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

  if (!editor) {
    return <div className="flex items-center justify-center h-screen">Loading editor...</div>
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
        <DocumentHeader
          title={documentTitle}
          setTitle={setDocumentTitle}
          onSave={() => saveDocument()}
          onNew={createNewDocument}
          documents={documents}
          onLoad={loadDocument}
          isSaving={isSaving}
        />
        <MainMenu
          editor={editor}
          documentTitle={documentTitle}
          onSave={() => saveDocument()}
          onNew={createNewDocument}
        />
        <EnhancedToolbar editor={editor} />

        {/* Horizontal ruler */}
        <HorizontalRuler scrollLeft={scrollPosition.x} />

        <div className="flex flex-1 overflow-hidden">
          {/* Main content area with rulers and document */}
          <div className="flex w-full h-full">
            {/* Vertical ruler - positioned against the left edge */}
            <VerticalRuler scrollTop={scrollPosition.y} />

            {/* Document content area with centered page */}
            <div ref={editorContainerRef} className="flex-1 overflow-auto bg-[#f1f3f4] flex flex-col">
              <div className="flex-1 py-4 flex justify-center">
                <div
                  className={cn(
                    "page-container relative bg-white",
                    "w-[816px] min-h-[1056px]", // US Letter size in pixels (8.5" x 11")
                    "border border-gray-200", // Lighter border
                    "shadow-[0_1px_3px_rgba(60,64,67,0.15)]", // More subtle shadow like Google Docs
                  )}
                  onClick={() => {
                    try {
                      if (editor && editor.commands && editor.commands.focus) {
                        editor.commands.focus()
                      }
                    } catch (error) {
                      console.error("Error focusing editor:", error)
                      setEditorError(`Error focusing editor: ${error instanceof Error ? error.message : String(error)}`)
                    }
                  }}
                >
                  <EditorContent editor={editor} className="page-content p-[1in]" />
                </div>
              </div>
            </div>
          </div>

          {/* Status indicator (similar to Google Docs) */}
          <div className="absolute bottom-10 right-4 bg-white rounded-md shadow-sm border border-gray-200 text-xs p-2 z-10">
            <div className="flex flex-col">
              <div className="text-gray-600">Editor Status:</div>
              <div className="flex items-center mt-1">
                <span className="mr-2">Editable:</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Focused:</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </div>
    </ErrorBoundary>
  )
}

