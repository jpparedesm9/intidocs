"use client"

import { GmailMainContent } from "./gmail-main-content"
import { TaskManagement } from "./task-management"
import { TrackingManagement } from "./tracking-management"
import { AdministrationManagement } from "./administration-management"
import { EmptyContent } from "./empty-content"
import { DashboardView } from "./dashboard-view"
import { DocumentSend } from "./document-send"
import { DocumentHistory } from "./document-history"
import DocumentEditor from "./document-editor"
import { useEffect, useState } from "react"

interface DynamicContentProps {
  selectedMenuItem: string
  documentId?: string | null
  sidebarCollapsed?: boolean
}

export function DynamicContent({ selectedMenuItem, documentId, sidebarCollapsed = false }: DynamicContentProps) {
  // Si tenemos un documentId, mostramos el editor independientemente del selectedMenuItem
  if (documentId) {
    return (
      <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
        <DocumentEditor initialDocumentId={documentId} sidebarCollapsed={sidebarCollapsed} />
      </div>
    );
  }

  // Si selectedMenuItem es "compose", mostrar el editor
  if (selectedMenuItem === "compose") {
    return (
      <div 
        className="w-full h-full" 
        style={{ 
          position: 'relative', 
          pointerEvents: 'auto',
          overflow: 'visible'
        }}
      >
        <DocumentEditor sidebarCollapsed={sidebarCollapsed} />
      </div>
    );
  }

  // Render different content based on the selected menu item
  switch (selectedMenuItem) {
    case "dashboard":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <DashboardView />
        </div>
      );
    case "recibidos":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <GmailMainContent />
        </div>
      );
    case "tareas":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <TaskManagement />
        </div>
      );
    case "seguimiento":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <TrackingManagement />
        </div>
      );
    case "administracion":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <AdministrationManagement />
        </div>
      );
    case "enviar":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <DocumentSend />
        </div>
      );
    case "historial":
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <DocumentHistory />
        </div>
      );
    default:
      return (
        <div className="w-full h-full" style={{ position: 'relative', pointerEvents: 'auto' }}>
          <EmptyContent selectedSection={selectedMenuItem} />
        </div>
      );
  }
}
