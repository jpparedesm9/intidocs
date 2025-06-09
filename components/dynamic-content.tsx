"use client"

import { GmailMainContent } from "./gmail-main-content"
import { TaskManagement } from "./task-management"
import { TrackingManagement } from "./tracking-management"
import { AdministrationManagement } from "./administration-management"
import { EmptyContent } from "./empty-content"
import { DashboardView } from "./dashboard-view"
import { DocumentSend } from "./document-send"
import { DocumentHistory } from "./document-history"

interface DynamicContentProps {
  selectedMenuItem: string
}

export function DynamicContent({ selectedMenuItem }: DynamicContentProps) {
  // Render different content based on the selected menu item
  switch (selectedMenuItem) {
    case "dashboard":
      return <DashboardView />
    case "recibidos":
      return <GmailMainContent />
    case "tareas":
      return <TaskManagement />
    case "seguimiento":
      return <TrackingManagement />
    case "administracion":
      return <AdministrationManagement />
    case "enviar":
      return <DocumentSend />
    case "historial":
      return <DocumentHistory />
    default:
      return <EmptyContent selectedSection={selectedMenuItem} />
  }
}
