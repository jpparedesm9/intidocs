"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useState, useMemo, useCallback, memo } from "react"
import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Strikethrough,
  Type,
  Palette,
  Highlighter,
  Undo,
  Redo,
  ChevronDown,
  Minus,
  FileIcon as FileTemplate,
  Paperclip,
  Eye,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import TableMenu from "./table-menu"
import TemplateManager from "./template-manager"

interface EnhancedToolbarProps {
  editor: Editor
  onOpenAttachmentManager?: () => void
  attachmentCount?: number
}

const EnhancedToolbar = memo(function EnhancedToolbar({
  editor,
  onOpenAttachmentManager,
  attachmentCount = 0,
}: EnhancedToolbarProps) {
  const [fontSize, setFontSize] = useState(11)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  const safeIsActive = useCallback(
    (name: string, attrs?: Record<string, any>) => {
      try {
        if (editor && editor.isActive) {
          return attrs ? editor.isActive(name, attrs) : editor.isActive(name)
        }
        return false
      } catch (error) {
        console.error(`Error checking if ${name} is active:`, error)
        return false
      }
    },
    [editor],
  )

  const safeCommand = useCallback((callback: () => void) => {
    return () => {
      try {
        callback()
      } catch (error) {
        console.error("Error executing command:", error)
      }
    }
  }, [])

  const addImage = useCallback(() => {
    try {
      const url = window.prompt("Enter the URL of the image:")
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (error) {
      console.error("Error adding image:", error)
    }
  }, [editor])

  const addLink = useCallback(() => {
    try {
      const url = window.prompt("Enter the URL:")
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    } catch (error) {
      console.error("Error adding link:", error)
    }
  }, [editor])

  const removeLink = useCallback(() => {
    try {
      editor.chain().focus().unsetLink().run()
    } catch (error) {
      console.error("Error removing link:", error)
    }
  }, [editor])

  const insertPageBreak = useCallback(() => {
    try {
      if (editor.chain) {
        editor.chain().focus().insertPageBreak().run()
      }
    } catch (error) {
      console.error("Error inserting page break:", error)
    }
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    try {
      editor.chain().focus().insertContent("<hr/>").run()
    } catch (error) {
      console.error("Error inserting horizontal rule:", error)
    }
  }, [editor])

  const handleFontSizeChange = useCallback(
    (value: number) => {
      try {
        setFontSize(value)
        // Only apply if the extension is available
        if (editor.can().setFontSize) {
          editor.chain().focus().setFontSize(`${value}px`).run()
        }
      } catch (error) {
        console.error("Error changing font size:", error)
      }
    },
    [editor],
  )

  const handleFontFamilyChange = useCallback(
    (font: string) => {
      try {
        setFontFamily(font)
        // Only apply if the extension is available
        if (editor.can().setFontFamily) {
          editor.chain().focus().setFontFamily(font).run()
        }
      } catch (error) {
        console.error("Error changing font family:", error)
      }
    },
    [editor],
  )

  const setTextColor = useCallback(
    (color: string) => {
      try {
        // Only apply if the extension is available
        if (editor.can().setColor) {
          editor.chain().focus().setColor(color).run()
        }
        setIsColorPickerOpen(false)
      } catch (error) {
        console.error("Error setting text color:", error)
      }
    },
    [editor, setIsColorPickerOpen],
  )

  const setHighlightColor = useCallback(
    (color: string) => {
      try {
        // Only apply if the extension is available
        if (editor.can().setHighlight) {
          editor.chain().focus().setHighlight({ color }).run()
        }
        setIsHighlightPickerOpen(false)
      } catch (error) {
        console.error("Error setting highlight color:", error)
      }
    },
    [editor, setIsHighlightPickerOpen],
  )

  // Memoize static arrays to prevent recreation on re-renders
  const colors = useMemo(
    () => [
      "#000000",
      "#434343",
      "#666666",
      "#999999",
      "#b7b7b7",
      "#cccccc",
      "#d9d9d9",
      "#efefef",
      "#f3f3f3",
      "#ffffff",
      "#980000",
      "#ff0000",
      "#ff9900",
      "#ffff00",
      "#00ff00",
      "#00ffff",
      "#4a86e8",
      "#0000ff",
      "#9900ff",
      "#ff00ff",
    ],
    [],
  )

  const fontFamilies = useMemo(() => ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"], [])

  // Memoize button click handlers
  const undoHandler = useCallback(
    safeCommand(() => editor?.chain().focus().undo().run()),
    [editor, safeCommand],
  )
  const redoHandler = useCallback(
    safeCommand(() => editor?.chain().focus().redo().run()),
    [editor, safeCommand],
  )
  const printHandler = useCallback(() => window.print(), [])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="border-b border-gray-200 bg-white p-1 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={undoHandler} title="Undo" className="h-8 w-8 p-0">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={redoHandler} title="Redo" className="h-8 w-8 p-0">
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 min-w-[100px] justify-between">
              <span className="text-xs">{fontFamily}</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fontFamilies.map((font) => (
              <DropdownMenuItem
                key={font}
                onClick={() => handleFontFamilyChange(font)}
                className="text-xs"
                style={{ fontFamily: font }}
              >
                {font}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Size - Increased width to show two digits */}
        <div className="flex items-center">
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number.parseInt(e.target.value) || 11)}
            className="h-8 w-16 text-xs" // Increased width from w-12 to w-16
            min={8}
            max={72}
          />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleBold().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("bold") ? "bg-gray-200" : "")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleItalic().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("italic") ? "bg-gray-200" : "")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleUnderline().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("underline") ? "bg-gray-200" : "")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleStrike().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("strike") ? "bg-gray-200" : "")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        {/* Text Color */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => setTextColor(color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover open={isHighlightPickerOpen} onOpenChange={setIsHighlightPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Highlight Color">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-10 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-5 h-5 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                  onClick={() => setHighlightColor(color)}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().setTextAlign("left").run())}
          className={cn("h-8 w-8 p-0", safeIsActive({ textAlign: "left" }) ? "bg-gray-200" : "")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().setTextAlign("center").run())}
          className={cn("h-8 w-8 p-0", safeIsActive({ textAlign: "center" }) ? "bg-gray-200" : "")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().setTextAlign("right").run())}
          className={cn("h-8 w-8 p-0", safeIsActive({ textAlign: "right" }) ? "bg-gray-200" : "")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().setTextAlign("justify").run())}
          className={cn("h-8 w-8 p-0", safeIsActive({ textAlign: "justify" }) ? "bg-gray-200" : "")}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleBulletList().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("bulletList") ? "bg-gray-200" : "")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().toggleOrderedList().run())}
          className={cn("h-8 w-8 p-0", safeIsActive("orderedList") ? "bg-gray-200" : "")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <Type className="h-4 w-4 mr-1" />
              Normal text
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={safeCommand(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
              className={safeIsActive("heading", { level: 1 }) ? "bg-gray-100" : ""}
            >
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={safeCommand(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
              className={safeIsActive("heading", { level: 2 }) ? "bg-gray-100" : ""}
            >
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={safeCommand(() => editor.chain().focus().setParagraph().run())}
              className={safeIsActive("paragraph") ? "bg-gray-100" : ""}
            >
              <Type className="h-4 w-4 mr-2" /> Normal text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Table Menu */}
        <TableMenu editor={editor} />
        {/* Horizontal Rule */}
        <Button
          variant="ghost"
          size="sm"
          onClick={insertHorizontalRule}
          title="Insert Horizontal Rule"
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        {/* Attachments Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenAttachmentManager}
          title="Adjuntar archivos"
          className="h-8 px-2 flex items-center gap-1"
        >
          <Paperclip className="h-4 w-4" />
          <span className="text-xs">Adjuntos</span>
          {attachmentCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1 min-w-[20px] h-5 flex items-center justify-center">
              {attachmentCount}
            </span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsTemplateManagerOpen(true)}
          title="Insert Template"
          className="h-8 px-2 flex items-center gap-1"
        >
          <FileTemplate className="h-4 w-4" />
          <span className="text-xs">Templates</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreviewModalOpen(true)}
          title="Vista Previa"
          className="h-8 px-2 flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          <span className="text-xs">Vista Previa</span>
        </Button>
      </div>

      {/* Template Manager Dialog */}
      <TemplateManager editor={editor} isOpen={isTemplateManagerOpen} onClose={() => setIsTemplateManagerOpen(false)} />

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Vista Previa del Documento</h2>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 p-4">
              <iframe
                src="https://www.unfv.edu.pe/ceprevi/images/servicios/ciclos/ciclo_c/2018/Libros/Literatura.pdf"
                className="w-full h-full border rounded"
                title="Vista Previa PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
})

EnhancedToolbar.displayName = "EnhancedToolbar"

export default EnhancedToolbar
