"use client"

import { useState } from "react"
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
  ImageIcon,
  FileQuestionIcon as FileBreak,
  Link,
  Unlink,
  Strikethrough,
  Type,
  Palette,
  Highlighter,
  Undo,
  Redo,
  Printer,
  ChevronDown,
  Minus,
  FileIcon as FileTemplate,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import TableMenu from "./table-menu"
import TemplateManager from "./template-manager"

interface EnhancedToolbarProps {
  editor: Editor
}

export default function EnhancedToolbar({ editor }: EnhancedToolbarProps) {
  const [fontSize, setFontSize] = useState(11)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isHighlightPickerOpen, setIsHighlightPickerOpen] = useState(false)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)

  if (!editor) {
    return null
  }

  const safeIsActive = (name: string, attrs?: Record<string, any>) => {
    try {
      if (editor && editor.isActive) {
        return attrs ? editor.isActive(name, attrs) : editor.isActive(name)
      }
      return false
    } catch (error) {
      console.error(`Error checking if ${name} is active:`, error)
      return false
    }
  }

  const safeCommand = (callback: () => void) => {
    return () => {
      try {
        callback()
      } catch (error) {
        console.error("Error executing command:", error)
      }
    }
  }

  const addImage = () => {
    try {
      const url = window.prompt("Enter the URL of the image:")
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (error) {
      console.error("Error adding image:", error)
    }
  }

  const addLink = () => {
    try {
      const url = window.prompt("Enter the URL:")
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    } catch (error) {
      console.error("Error adding link:", error)
    }
  }

  const removeLink = () => {
    try {
      editor.chain().focus().unsetLink().run()
    } catch (error) {
      console.error("Error removing link:", error)
    }
  }

  const insertPageBreak = () => {
    try {
      if (editor.chain) {
        editor.chain().focus().insertPageBreak().run()
      }
    } catch (error) {
      console.error("Error inserting page break:", error)
    }
  }

  const insertHorizontalRule = () => {
    try {
      editor.chain().focus().insertContent("<hr/>").run()
    } catch (error) {
      console.error("Error inserting horizontal rule:", error)
    }
  }

  const handleFontSizeChange = (value: number) => {
    try {
      setFontSize(value)
      // Only apply if the extension is available
      if (editor.can().setFontSize) {
        editor.chain().focus().setFontSize(`${value}px`).run()
      }
    } catch (error) {
      console.error("Error changing font size:", error)
    }
  }

  const handleFontFamilyChange = (font: string) => {
    try {
      setFontFamily(font)
      // Only apply if the extension is available
      if (editor.can().setFontFamily) {
        editor.chain().focus().setFontFamily(font).run()
      }
    } catch (error) {
      console.error("Error changing font family:", error)
    }
  }

  const setTextColor = (color: string) => {
    try {
      // Only apply if the extension is available
      if (editor.can().setColor) {
        editor.chain().focus().setColor(color).run()
      }
      setIsColorPickerOpen(false)
    } catch (error) {
      console.error("Error setting text color:", error)
    }
  }

  const setHighlightColor = (color: string) => {
    try {
      // Only apply if the extension is available
      if (editor.can().setHighlight) {
        editor.chain().focus().setHighlight({ color }).run()
      }
      setIsHighlightPickerOpen(false)
    } catch (error) {
      console.error("Error setting highlight color:", error)
    }
  }

  const colors = [
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
  ]

  const fontFamilies = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"]

  return (
    <>
      <div className="border-b border-gray-200 bg-white p-1 flex flex-wrap items-center gap-1">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().undo().run())}
          title="Undo"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={safeCommand(() => editor.chain().focus().redo().run())}
          title="Redo"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => window.print()} title="Print" className="h-8 w-8 p-0">
          <Printer className="h-4 w-4" />
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

        {/* Insert */}
        <Button variant="ghost" size="sm" onClick={addImage} title="Insert Image" className="h-8 w-8 p-0">
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Table Menu */}
        <TableMenu editor={editor} />

        {/* Template Button */}
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

        {/* Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          title="Insert Link"
          className={cn("h-8 w-8 p-0", safeIsActive("link") ? "bg-gray-200" : "")}
        >
          <Link className="h-4 w-4" />
        </Button>

        {/* Unlink */}
        <Button
          variant="ghost"
          size="sm"
          onClick={removeLink}
          title="Remove Link"
          className="h-8 w-8 p-0"
          disabled={!safeIsActive("link")}
        >
          <Unlink className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Page Break */}
        <Button variant="ghost" size="sm" onClick={insertPageBreak} title="Insert Page Break" className="h-8 w-8 p-0">
          <FileBreak className="h-4 w-4" />
        </Button>
      </div>

      {/* Template Manager Dialog */}
      <TemplateManager editor={editor} isOpen={isTemplateManagerOpen} onClose={() => setIsTemplateManagerOpen(false)} />
    </>
  )
}
