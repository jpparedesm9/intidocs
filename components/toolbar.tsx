"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ImageIcon,
  FileQuestionIcon as FileBreak,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TableMenu from "./table-menu"

interface ToolbarProps {
  editor: Editor
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  const addImage = () => {
    try {
      const url = window.prompt("Enter the URL of the image:")

      if (url && editor.chain) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (error) {
      console.error("Error adding image:", error)
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

  return (
    <div className="border-b border-gray-200 bg-white p-2 flex flex-wrap gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().toggleBold().run())}
        className={safeIsActive("bold") ? "bg-gray-200" : ""}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().toggleItalic().run())}
        className={safeIsActive("italic") ? "bg-gray-200" : ""}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().toggleUnderline().run())}
        className={safeIsActive("underline") ? "bg-gray-200" : ""}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().setTextAlign("left").run())}
        className={safeIsActive({ textAlign: "left" }) ? "bg-gray-200" : ""}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().setTextAlign("center").run())}
        className={safeIsActive({ textAlign: "center" }) ? "bg-gray-200" : ""}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().setTextAlign("right").run())}
        className={safeIsActive({ textAlign: "right" }) ? "bg-gray-200" : ""}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Heading">
            <Heading1 className="h-4 w-4" />
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
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().toggleBulletList().run())}
        className={safeIsActive("bulletList") ? "bg-gray-200" : ""}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={safeCommand(() => editor.chain().focus().toggleOrderedList().run())}
        className={safeIsActive("orderedList") ? "bg-gray-200" : ""}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button variant="ghost" size="sm" onClick={addImage} title="Insert Image">
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* Table Menu */}
      <TableMenu editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button variant="ghost" size="sm" onClick={insertPageBreak} title="Insert Page Break">
        <FileBreak className="h-4 w-4" />
      </Button>
    </div>
  )
}

