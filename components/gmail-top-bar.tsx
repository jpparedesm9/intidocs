"use client"

import { Search, Settings, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GmailTopBar() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white z-30 relative h-14">
      <div className="flex items-center gap-4 flex-1 md:ml-64 ml-0 transition-all">
        {/* Gmail Logo - only visible on larger screens */}
        <div className="hidden md:flex items-center md:absolute md:left-6">
          <svg height="24" viewBox="0 0 75 24" width="75" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="M.5 0h74v24H.5z" />
              <path
                d="M31.5 16.3h-3.2v-9h3.2c2.3 0 4.4 1.8 4.4 4.5s-2.1 4.5-4.4 4.5zm0-7.1h-1.2v5.2h1.2c1.4 0 2.3-1 2.3-2.6s-.9-2.6-2.3-2.6zm8.5 7.1h-2v-9h4.9v1.9h-2.9v1.9h2.8v1.9h-2.8zm6.2 0h-2v-9h2zm5.7 0h-2v-7.1h-1.8v-1.9h5.5v1.9h-1.7zm6.4.2c-2.6 0-4.1-1.9-4.1-4.6s1.5-4.6 4.1-4.6c2.5 0 4 1.9 4 4.6s-1.5 4.6-4 4.6zm0-7.3c-1.3 0-2 1.1-2 2.7s.7 2.7 2 2.7c1.2 0 1.9-1.1 1.9-2.7s-.7-2.7-1.9-2.7zm9 7.1h-1.9l-3-9h2.2l1.7 5.9 1.7-5.9h2.2z"
                fill="#5f6368"
              />
              <path
                d="M74.5 9c0-1-.3-1.9-.9-2.6-.6-.7-1.3-1-2.2-1-1 0-1.7.3-2.2 1-.6.7-.9 1.6-.9 2.6 0 1 .3 1.9.9 2.6.6.7 1.3 1 2.2 1 .9 0 1.7-.3 2.2-1 .6-.7.9-1.6.9-2.6zm-1.7 0c0 .5-.1 1-.4 1.3-.3.4-.6.5-1 .5-.4 0-.8-.2-1-.5-.3-.3-.4-.8-.4-1.3s.1-1 .4-1.3c.3-.4.6-.5 1-.5.4 0 .8.2 1 .5.3.3.4.8.4 1.3zm-6.8-3.4h-1.7v1.4h1.7v1.7h-1.7v1.4h1.7v1.7h-1.7v1.4h1.7v1.7h-4.3V4h4.3zm-7.5 8.3h-2.6V4h2.6c1.9 0 3.5.6 4.5 1.8 1.1 1.2 1.7 2.8 1.7 4.6s-.6 3.4-1.7 4.6c-1.1 1.2-2.6 1.9-4.5 1.9zm0-10.5h-.9v8.7h.9c1.5 0 2.6-.5 3.4-1.5.8-1 1.2-2.2 1.2-3.8 0-1.6-.4-2.9-1.2-3.8-.8-1-1.9-1.6-3.4-1.6z"
                fill="#4285f4"
              />
              <path d="M17.3 13.3c0-.3-.1-.5-.3-.7l-1.7-1.7h-1.6v2.4h1.6z" fill="#4285f4" fillRule="nonzero" />
              <path d="M25.3 13.3c0-.3-.1-.5-.3-.7l-1.7-1.7h-1.6v2.4h1.6z" fill="#ea4335" fillRule="nonzero" />
              <path d="M21.3 17.3c0-.3-.1-.5-.3-.7l-1.7-1.7h-1.6v2.4h1.6z" fill="#34a853" fillRule="nonzero" />
              <path d="M21.3 9.3c0-.3-.1-.5-.3-.7l-1.7-1.7h-1.6v2.4h1.6z" fill="#fbbc04" fillRule="nonzero" />
            </g>
          </svg>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search mail"
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
