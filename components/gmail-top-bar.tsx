"use client"

import { Search, Settings, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GmailTopBar() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white z-30 relative h-14">
      <div className="flex items-center gap-4 flex-1 md:ml-64 ml-0 transition-all">
        {/* Logo - Comentado temporalmente
        <div className="hidden md:flex items-center md:absolute md:left-6">
          <span className="font-bold">SGDocs</span>
        </div> */}

        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Buscar"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center ml-4 gap-2">
        <Button variant="ghost" size="icon" className="text-gray-500 hidden md:flex">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hidden md:flex">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Profile Button */}
        <Button className="rounded-full w-8 h-8 p-0 overflow-hidden">
          <img src="/abstract-profile.png" alt="Profile" className="w-full h-full object-cover" />
        </Button>
      </div>
    </div>
  )
}
