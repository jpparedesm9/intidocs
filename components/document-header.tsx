"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Save, FileText, Plus, Menu } from "lucide-react"

interface DocumentHeaderProps {
  title: string
  setTitle: (title: string) => void
  onSave: () => void
  onNew: () => void
  documents: Array<{ id: string; title: string }>
  onLoad: (id: string) => void
  isSaving: boolean
}

export default function DocumentHeader({
  title,
  setTitle,
  onSave,
  onNew,
  documents,
  onLoad,
  isSaving,
}: DocumentHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false)
                }
              }}
              autoFocus
              className="h-8 text-lg font-medium"
            />
          ) : (
            <h1 className="text-lg font-medium cursor-pointer" onClick={() => setIsEditing(true)}>
              {title}
            </h1>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onSave} className="flex items-center">
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" size="sm" onClick={onNew} className="flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNew} className="cursor-pointer">
              New Document
            </DropdownMenuItem>
            {documents.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-sm font-semibold">Recent Documents</div>
                {documents.map((doc) => (
                  <DropdownMenuItem key={doc.id} onClick={() => onLoad(doc.id)} className="cursor-pointer">
                    {doc.title}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

