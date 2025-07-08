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

      {/* Right section - User profile & settings */}
      <div className="flex items-center space-x-2 pr-4">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 overflow-hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.fullName ? getInitials(user.fullName) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <p className="font-medium">{user?.fullName || "Usuario"}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email || "email@example.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="cursor-pointer" onClick={() => {}}>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            
            {/* Profiles Submenu */}
            {userProfiles.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-gray-500 py-1">
                  Perfiles
                </DropdownMenuLabel>
                
                {userProfiles.map((profile) => (
                  <DropdownMenuItem 
                    key={profile.profileId} 
                    className="cursor-pointer"
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div className="flex items-center w-full">
                      <span className={`${activeProfile?.profileId === profile.profileId ? 'font-medium' : ''} flex-1`}>
                        {profile.departmentName} - {profile.position}
                      </span>
                      {activeProfile?.profileId === profile.profileId && (
                        <div className="h-2 w-2 rounded-full bg-green-500 ml-1"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
