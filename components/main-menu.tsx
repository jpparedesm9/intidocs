"use client"

import type React from "react"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  FileIcon,
  Eye,
  HelpCircle,
  Save,
  Printer,
  FileText,
  Download,
  Copy,
  Scissors,
  ClipboardPaste,
  Undo,
  Redo,
  Search,
  Image,
  Table,
  Link,
  FileInput,
  Minus,
  FileIcon as FileTemplate,
} from "lucide-react"
import type { Editor } from "@tiptap/react"
import { useToast } from "@/hooks/use-toast"
import TemplateManager from "./template-manager"

interface MainMenuProps {
  editor: Editor | null
  documentTitle: string
  onSave: () => void
}

export default function MainMenu({ editor, documentTitle, onSave }: MainMenuProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const { toast } = useToast()

  if (!editor) return null

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    if (!editor || isExporting) return

    try {
      setIsExporting(true)
      toast({
        title: "Preparing PDF export",
        description: "Please wait while we generate your PDF...",
      })

      const editorElement = document.querySelector(".page-container") as HTMLElement
      if (!editorElement) {
        throw new Error("Could not find editor content")
      }

      // Dynamically import the export utility
      const { exportToPDF } = await import("@/lib/export-utils")
      await exportToPDF(editorElement, documentTitle || "document")

      toast({
        title: "Export successful",
        description: "Your PDF has been downloaded.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export failed",
        description:
          "There was a problem exporting your document. Some images may not be included due to security restrictions.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    if (!editor || isExporting) return

    try {
      setIsExporting(true)
      toast({
        title: "Preparing DOCX export",
        description: "Please wait while we generate your document...",
      })

      const editorContent = editor.getHTML()

      // Dynamically import the export utility
      const { exportToDOCX } = await import("@/lib/export-utils")
      await exportToDOCX(editorContent, documentTitle || "document")

      toast({
        title: "Export successful",
        description: "Your DOCX file has been downloaded. Note: Some formatting and images may not be preserved.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error exporting DOCX:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting your document to DOCX format.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportHTML = async () => {
    if (!editor) return

    try {
      toast({
        title: "Preparing HTML export",
        description: "Please wait while we generate your HTML document...",
      })

      const editorContent = editor.getHTML()

      // Dynamically import the export utility
      const { exportToHTML } = await import("@/lib/export-utils")
      await exportToHTML(editorContent, documentTitle || "document")

      toast({
        title: "Export successful",
        description: "Your HTML file has been downloaded.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error exporting HTML:", error)
      toast({
        title: "Export failed",
        description: "There was a problem exporting your document to HTML format.",
        variant: "destructive",
      })
    }
  }

  const handlePreview = () => {
    // Open a new window with just the document content
    const editorContent = editor.getHTML()
    const previewWindow = window.open("", "_blank")
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${documentTitle} - Preview</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              min-height: 11in;
            }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ddd; padding: 8px; }
            hr { border: none; border-top: 1px solid #000; margin: 1em 0; }
            .horizontal-rule { border-top: 1px solid #000; margin: 1em 0; }
          </style>
        </head>
        <body>
          ${editorContent}
        </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const togglePageRulers = () => {
    try {
      // Toggle rulers on the page container
      const pageContainer = document.querySelector(".page-container")
      if (pageContainer) {
        pageContainer.classList.toggle("with-rulers")
      }
    } catch (error) {
      console.error("Error toggling page rulers:", error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === "string") {
        editor.commands.setContent(content)
      }
    }
    reader.readAsText(file)
  }

  const insertHorizontalRule = () => {
    try {
      editor.chain().focus().insertContent("<hr/>").run()
    } catch (error) {
      console.error("Error inserting horizontal rule:", error)
    }
  }

  const insertPageBorder = () => {
    try {
      // Add a class to the page container to show borders
      const pageContainer = document.querySelector(".page-container")
      if (pageContainer) {
        pageContainer.classList.toggle("with-border")
      }
    } catch (error) {
      console.error("Error toggling page border:", error)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-1 px-2 border-b">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {/* New document option removed */}
            <DropdownMenuItem>
              <label className="flex items-center cursor-pointer w-full">
                <FileInput className="mr-2 h-4 w-4" />
                <span>Open</span>
                <input type="file" className="hidden" accept=".html,.txt,.md" onChange={handleFileUpload} />
              </label>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              <span>Save</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span>Print</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Preview</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Export As</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "PDF Document"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportDOCX} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "Word Document (.docx)"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportHTML}>
              <FileText className="mr-2 h-4 w-4" />
              <span>HTML Document</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => editor.commands.undo()}>
              <Undo className="mr-2 h-4 w-4" />
              <span>Undo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.commands.redo()}>
              <Redo className="mr-2 h-4 w-4" />
              <span>Redo</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                document.execCommand("copy")
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                document.execCommand("cut")
              }}
            >
              <Scissors className="mr-2 h-4 w-4" />
              <span>Cut</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                document.execCommand("paste")
              }}
            >
              <ClipboardPaste className="mr-2 h-4 w-4" />
              <span>Paste</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const searchTerm = prompt("Search for:")
                if (searchTerm) {
                  // Implement search functionality
                  alert(`Search for "${searchTerm}" not implemented yet`)
                }
              }}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Find and Replace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={toggleFullscreen}>
              <Eye className="mr-2 h-4 w-4" />
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Print Preview</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={insertPageBorder}>
              <Minus className="mr-2 h-4 w-4" />
              <span>Toggle Page Border</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={togglePageRulers}>
              <Minus className="mr-2 h-4 w-4" />
              <span>Toggle Page Rulers</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Insert Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => {
                const url = prompt("Enter image URL:")
                if (url) editor.commands.setImage({ src: url })
              }}
            >
              <Image className="mr-2 h-4 w-4" />
              <span>Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              }}
            >
              <Table className="mr-2 h-4 w-4" />
              <span>Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const url = prompt("Enter link URL:")
                if (url) editor.commands.setLink({ href: url })
              }}
            >
              <Link className="mr-2 h-4 w-4" />
              <span>Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={insertHorizontalRule}>
              <Minus className="mr-2 h-4 w-4" />
              <span>Horizontal Rule</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.commands.insertPageBreak()
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Page Break</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsTemplateManagerOpen(true)}>
              <FileTemplate className="mr-2 h-4 w-4" />
              <span>Template</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Format Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Format
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => editor.commands.toggleBold()}>
                <span>Bold</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.commands.toggleItalic()}>
                <span>Italic</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.commands.toggleUnderline()}>
                <span>Underline</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => editor.commands.setTextAlign("left")}>
                <span>Align Left</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.commands.setTextAlign("center")}>
                <span>Align Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.commands.setTextAlign("right")}>
                <span>Align Right</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.commands.setTextAlign("justify")}>
                <span>Justify</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={insertPageBorder}>
              <span>Page Border</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tools Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Tools
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => {
                alert("Word count feature not implemented yet")
              }}
            >
              <span>Word Count</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-sm">
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => {
                alert("Documentation not available yet")
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                alert("About: Google Docs Clone\nVersion: 1.0.0")
              }}
            >
              <span>About</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Template Manager Dialog */}
      <TemplateManager editor={editor} isOpen={isTemplateManagerOpen} onClose={() => setIsTemplateManagerOpen(false)} />
    </>
  )
}
