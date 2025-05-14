"use client"

import { useState } from "react"
import {
  Search,
  Menu,
  Settings,
  HelpCircle,
  AppWindowIcon as Apps,
  Star,
  Clock,
  Send,
  ChevronDown,
  ChevronRight,
  Inbox,
  Edit3,
  RefreshCw,
  MoreVertical,
  Calendar,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function GmailInterface() {
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    labels: false,
  })

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

  // Mock email data
  const emails = [
    {
      id: 1,
      sender: "LATAM Airlines",
      subject: "🛫 New flight deals to South America!",
      preview: "Discover Ecuador and more destinations with our special offers...",
      time: "14:06",
      read: false,
    },
    {
      id: 2,
      sender: "FlowerShop",
      subject: "The most magical time of year has arrived!",
      preview: "It's Peony season! Check out our fresh collection...",
      time: "14:04",
      read: false,
    },
    {
      id: 3,
      sender: "eBay",
      subject: "Make an offer for Royal Prestige Pan",
      preview: "Brand New, limited time offer...",
      time: "13:32",
      read: true,
    },
    {
      id: 4,
      sender: "Motion Array",
      subject: "Get assets for wedding season",
      preview: "Wedding season is kicking off...",
      time: "13:02",
      read: true,
    },
    {
      id: 5,
      sender: "Diners Club",
      subject: "Hello, your payment is ready",
      preview: "Your payment has been processed successfully...",
      time: "12:55",
      read: true,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <header className="flex items-center px-4 py-2 border-b">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 w-6 mr-2"
                style={{ color: "#4285F4" }}
              >
                <path
                  fill="currentColor"
                  d="M22.057 20h-20.114c-1.071 0-1.943-.873-1.943-1.944v-12.112c0-1.071.872-1.944 1.943-1.944h20.114c1.071 0 1.943.873 1.943 1.944v12.111c0 1.072-.872 1.945-1.943 1.945zm-1.364-13.892l-8.693 5.926-8.693-5.926h17.386zm1.364-2.108h-20.114c-.071 0-.129.058-.129.129v12.111c0 .071.058.13.129.13h20.114c.071 0 .129-.059.129-.13v-12.111c0-.071-.058-.129-.129-.129z"
                />
              </svg>
              <span className="text-xl font-normal text-gray-700">Gmail</span>
            </div>
          </div>
          <div className="flex-1 mx-4 max-w-4xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search mail"
                className="pl-10 py-1.5 bg-gray-100 border-0 rounded-lg w-full focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Apps className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="border-r border-gray-200 w-64 flex-shrink-0">
            <SidebarHeader className="p-0">
              <div className="p-4 pb-2">
                <Button
                  onClick={handleComposeClick}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-2xl py-3 px-6 flex items-center justify-start shadow-sm"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Compose
                </Button>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive className="py-2">
                    <Inbox className="h-4 w-4 mr-3" />
                    <span>Inbox</span>
                    <span className="ml-auto text-sm font-medium">14</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2">
                    <Star className="h-4 w-4 mr-3" />
                    <span>Starred</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2">
                    <Clock className="h-4 w-4 mr-3" />
                    <span>Snoozed</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2">
                    <Send className="h-4 w-4 mr-3" />
                    <span>Sent</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2">
                    <Edit3 className="h-4 w-4 mr-3" />
                    <span>Drafts</span>
                    <span className="ml-auto text-sm font-medium">3</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2">
                    <Trash2 className="h-4 w-4 mr-3" />
                    <span>Trash</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              {/* Categories Section */}
              <div className="mt-2">
                <div
                  onClick={() => toggleSection("categories")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-r-full"
                >
                  {expandedSections.categories ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  Categories
                </div>
                {expandedSections.categories && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <AlertCircle className="h-4 w-4 mr-3" />
                        <span>Updates</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <Calendar className="h-4 w-4 mr-3" />
                        <span>Forums</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <AlertCircle className="h-4 w-4 mr-3" />
                        <span>Promotions</span>
                        <span className="ml-auto text-sm font-medium">24</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>

              {/* Labels Section */}
              <div className="mt-2">
                <div
                  onClick={() => toggleSection("labels")}
                  className="flex items-center px-4 py-1 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-r-full"
                >
                  {expandedSections.labels ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  Labels
                </div>
                {expandedSections.labels && (
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                        <span>Personal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                        <span>Work</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                        <span>Travel</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton className="py-2 pl-9">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-3"></span>
                        <span>Projects</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}
              </div>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-4 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Storage: 15% used</span>
                  <span>3.5 GB of 15 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-blue-600 h-1 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Email toolbar */}
            <div className="border-b py-2 px-4 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-5 h-5">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </div>
                <Button variant="ghost" size="sm" className="p-1">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">1-5 of 124</div>
            </div>

            {/* Email list */}
            <div className="flex-1 overflow-auto">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-center px-4 py-2 border-b hover:bg-gray-100 cursor-pointer",
                    !email.read && "font-medium",
                  )}
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-4">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                  </div>
                  <Star className="h-4 w-4 text-gray-400 hover:text-yellow-400 mr-4" />
                  <div className="w-48 truncate">{email.sender}</div>
                  <div className="flex-1 truncate">
                    <span className="mr-2">{email.subject}</span>
                    <span className="text-gray-500">- {email.preview}</span>
                  </div>
                  <div className="ml-4 text-sm text-gray-500 whitespace-nowrap">{email.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
