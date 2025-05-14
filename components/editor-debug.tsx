"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"

interface EditorDebugProps {
  editor: Editor | null
}

export default function EditorDebug({ editor }: EditorDebugProps) {
  const [isEditable, setIsEditable] = useState<boolean>(true)
  const [isFocused, setIsFocused] = useState<boolean>(false)

  useEffect(() => {
    if (!editor) return

    const updateStatus = () => {
      setIsEditable(editor.isEditable)
      setIsFocused(editor.isFocused)
    }

    editor.on("focus", updateStatus)
    editor.on("blur", updateStatus)
    editor.on("transaction", updateStatus)

    return () => {
      editor.off("focus", updateStatus)
      editor.off("blur", updateStatus)
      editor.off("transaction", updateStatus)
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow-lg z-50 text-xs">
      <div>Editor Status:</div>
      <div>Editable: {isEditable ? "✅" : "❌"}</div>
      <div>Focused: {isFocused ? "✅" : "❌"}</div>
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" onClick={() => editor.commands.focus()} className="text-xs py-0 h-6">
          Focus
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.setEditable(!editor.isEditable)}
          className="text-xs py-0 h-6"
        >
          Toggle Editable
        </Button>
      </div>
    </div>
  )
}
