"use client"

import { Suspense } from "react"
import DocumentEditor from "@/components/document-editor"

function ComposePageContent() {
  return (
    <div className="h-screen w-full">
      <DocumentEditor />
    </div>
  )
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-lg">Cargando editor...</div>
        </div>
      }
    >
      <ComposePageContent />
    </Suspense>
  )
}
