"use client"

import { useState } from "react"
import {
  Clock,
  Send,
  ChevronDown,
  ChevronRight,
  Inbox,
  Edit3,
  Calendar,
  Trash2,
  AlertCircle,
  Mail,
  CheckSquare,
  FileText,
  Users,
  Bookmark,
  Box,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { GmailMainContent } from "./gmail-main-content"
import { GmailTopBar } from "./gmail-top-bar"

export default function GmailInterface() {
  const [expandedSections, setExpandedSections] = useState({
    folders: true,
    tags: false,
    views: true,
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleComposeClick = () => {
    // Open editor in a new tab
    window.open("/compose", "_blank")
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-white">
        {/* Top Bar with Search and Profile */}
        <GmailTopBar />

        <div className="flex flex-1 overflow-hidden w-full max-w-full relative">
          {/* Left Sidebar */}
          <Sidebar className="border-r border-gray-200 w-64 flex-shrink-0 bg-[#202124] text-white md:block hidden z-10">
            <SidebarContent className="px-2">
              {/* Main Navigation */}
              <div className="mb-4">
                <SidebarMenu>
                 <SidebarMenuItem>
                    <div className="p-4 pb-2">
                <Button
                  onClick={handleComposeClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-3 px-6 flex items-center justify-start"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Nuevo Documento
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive className="py-2 text-white hover:bg-gray-700">
                      <Mail className="h-5 w-5 mr-3" />
                      <span>Mail</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                      <span className="ml-8">Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                      <span className="ml-8">All unread</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                      <span className="ml-8">Create a group</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>

              {/* Calendar, ToDo, etc. */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <CheckSquare className="h-5 w-5 mr-3" />
                    <span>ToDo</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <FileText className="h-5 w-5 mr-3" />
                    <span>Notes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <Users className="h-5 w-5 mr-3" />
                    <span>Contacts</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <Bookmark className="h-5 w-5 mr-3" />
                    <span>Bookmarks</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                    <Box className="h-5 w-5 mr-3" />
                    <span>Resources</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* Folders Section */}
              <div className="mt-6">
                <div
                  onClick={() => toggleSection("folders")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  {expandedSections.folders ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  FOLDERS
                  <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedSections.folders && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive className="py-2 text-white hover:bg-gray-700">
                        <Inbox className="h-4 w-4 mr-3" />
                        <span>Inbox</span>
                        <span className="ml-auto text-sm">8</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Edit3 className="h-4 w-4 mr-3" />
                        <span>Drafts</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <FileText className="h-4 w-4 mr-3" />
                        <span>Templates</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Clock className="h-4 w-4 mr-3" />
                        <span>Snoozed</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Send className="h-4 w-4 mr-3" />
                        <span>Sent</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <AlertCircle className="h-4 w-4 mr-3" />
                        <span>Spam</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Trash2 className="h-4 w-4 mr-3" />
                        <span>Trash</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Box className="h-4 w-4 mr-3" />
                        <span>Outbox</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Mail className="h-4 w-4 mr-3" />
                        <span>Newsletter</span>
                        <span className="ml-auto text-sm">43</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <Bell className="h-4 w-4 mr-3" />
                        <span>Notification</span>
                        <span className="ml-auto text-sm">4</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>

              {/* Tags Section */}
              <div className="mt-2">
                <div
                  onClick={() => toggleSection("tags")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  {expandedSections.tags ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  TAGS
                  <div className="ml-auto flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Views Section */}
              <div className="mt-2">
                <div
                  onClick={() => toggleSection("views")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-700 rounded-md"
                >
                  {expandedSections.views ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  VIEWS
                </div>
                {expandedSections.views && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <span>Unread</span>
                        <span className="ml-auto text-sm">55</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <span>All messages</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <span>Flagged</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 text-gray-300 hover:bg-gray-700">
                        <span>All archived</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Mobile buttons - only visible on small screens */}
          <div className="md:hidden fixed bottom-4 left-4 z-10 flex gap-2">
            <Button
              onClick={handleComposeClick}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Edit3 className="h-5 w-5 mr-2" />
              Nuevo
            </Button>
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              size="icon"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile sidebar - only visible when toggled */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20">
              <div className="h-full w-64 bg-[#202124] text-white overflow-auto">
                {/* Mobile sidebar content - copy of desktop sidebar */}
                <div className="p-4 pb-2">
                  <Button
                    onClick={handleComposeClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl py-3 px-6 flex items-center justify-start"
                  >
                    <Edit3 className="h-4 w-4 mr-3" />
                    Nuevo Documento
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </div>
                {/* Rest of mobile sidebar content */}
                <Button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-2 right-2 text-white"
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Main Content - ensure it takes full width */}
          <GmailMainContent />
        </div>
      </div>
    </SidebarProvider>
  )
}

// Add missing Bell icon
function Bell(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
