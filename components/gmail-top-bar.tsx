"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Settings, HelpCircle, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"

interface GmailTopBarProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function GmailTopBar({ toggleSidebar, sidebarCollapsed }: GmailTopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { 
    user, 
    logout, 
    userProfiles, 
    activeProfile, 
    setActiveProfile, 
    loadUserProfiles 
  } = useAuth()

  // Load profiles when component mounts, only once if no profiles exist
  useEffect(() => {
    if (user && userProfiles.length === 0) {
      loadUserProfiles()
    }
  }, [user, userProfiles.length, loadUserProfiles])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile)
  }

  return (
    <div className="flex items-center justify-between px-0 py-2 bg-white border-b border-gray-200 h-14 fixed top-0 left-0 right-0 z-20">
      {/* Left section - Logo placeholder que se contrae con el menú */}
      <div className="flex items-center" style={{ 
          width: sidebarCollapsed ? '4rem' : '16rem',
          transition: 'width 0.3s ease-in-out',
          borderRight: '1px solid #e5e7eb'
        }}>
        {/* Logo placeholder - contraído o expandido según el estado del menú */}
        <div className="h-8 flex items-center justify-center w-full">
          {sidebarCollapsed ? (
            <div className="text-lg font-bold text-gray-700">LG</div>
          ) : (
            <div className="text-lg font-semibold text-gray-700 pl-4">LOGO</div>
          )}
        </div>
      </div>
      
      {/* Hamburger menu - ahora inmediatamente después del logo */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          toggleSidebar();
        }} 
        className="top-bar-menu-button"
        title={sidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center section - Search - ajustado para considerar el nuevo espacio */}
      <div className="flex-1 max-w-2xl ml-2">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar documentos, tareas, usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
    </div>
  )
}
