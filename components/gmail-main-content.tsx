"use client"

import { useState } from "react"
import { ChevronDown, LayoutGrid, ListIcon, MoreHorizontal, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmailSection } from "./responsive-email-list"

export function GmailMainContent() {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([7])
  const [starredEmails, setStarredEmails] = useState<number[]>([])

  // Mock email data
  const marchEmails = [
    {
      id: 1,
      sender: "support@wasabi.com",
      subject: "Final warning about your expired trial Wasabi account",
      preview: "",
      time: "MON MAR 24 11:00 PM",
      read: false,
      size: "8 KB",
      hasAttachment: false,
    },
    {
      id: 2,
      sender: "support@wasabi.com",
      subject: "Your Wasabi free trial is about to expire",
      preview: "",
      time: "SUN MAR 23 11:00 PM",
      read: false,
      size: "6 KB",
      hasAttachment: false,
    },
    {
      id: 3,
      sender: "support@wasabi.com",
      subject: "Your Wasabi free trial is about to expire",
      preview: "",
      time: "FRI MAR 21 11:00 PM",
      read: true,
      size: "6 KB",
      hasAttachment: false,
    },
    {
      id: 4,
      sender: "support@wasabi.com",
      subject: "Your Wasabi free trial is about to expire",
      preview: "",
      time: "MON MAR 17 11:00 PM",
      read: true,
      size: "6 KB",
      hasAttachment: false,
    },
    {
      id: 5,
      sender: "support@idrive.com",
      subject: "Getting Started with Your IDrive® e2 S3 Compatible Cloud Storage Trial",
      preview: "",
      time: "FRI MAR 7 8:27 PM",
      read: true,
      size: "12 KB",
      hasAttachment: true,
    },
    {
      id: 6,
      sender: "darell@idrive.com",
      subject: "You've created an IDrive e2 trial account- Now what?",
      preview: "",
      time: "FRI MAR 7 1:55 PM",
      read: true,
      size: "6 KB",
      hasAttachment: false,
    },
  ]

  const februaryEmails = [
    {
      id: 7,
      sender: "darell@idrive.com",
      subject: "You've created an IDrive e2 trial account- Now what?",
      preview: "",
      time: "THU MAR 6 4:54 PM",
      read: true,
      size: "6 KB",
      hasAttachment: false,
      isSelected: selectedEmails.includes(7),
    },
    {
      id: 8,
      sender: "support@idrive.com",
      subject: "Your IDrive® e2 account is ready to use!",
      preview: "",
      time: "THU MAR 6 4:25 PM",
      read: true,
      size: "9 KB",
      hasAttachment: false,
    },
  ]

  const handleSelectEmail = (id: number) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  const handleStarEmail = (id: number) => {
    setStarredEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  // Add isSelected and isStarred properties to emails
  const marchEmailsWithState = marchEmails.map((email) => ({
    ...email,
    isSelected: selectedEmails.includes(email.id),
    isStarred: starredEmails.includes(email.id),
  }))

  const februaryEmailsWithState = februaryEmails.map((email) => ({
    ...email,
    isSelected: selectedEmails.includes(email.id),
    isStarred: starredEmails.includes(email.id),
  }))

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full pl-0 pr-0 md:pl-0 md:pr-0 lg:pr-0 xl:pr-0 box-border">
      {/* No tabs - removed as requested */}

      {/* Inbox Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b w-full">
        <div className="flex items-center">
          <span className="font-medium mr-2">Inbox</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
          <span className="ml-4 text-blue-600 md:inline hidden">8 Unread emails</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-500 md:flex hidden">
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500 md:flex hidden">
            <ListIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Email Toolbar */}
      <div className="flex items-center px-4 py-2 border-b bg-white justify-between w-full">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            checked={selectedEmails.length > 0}
            onChange={() => {
              if (selectedEmails.length > 0) {
                setSelectedEmails([])
              } else {
                setSelectedEmails([...marchEmails, ...februaryEmails].map((e) => e.id))
              }
            }}
          />
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex items-center ml-4 md:flex hidden">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <span className="text-sm mr-1">Views</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center ml-2 lg:flex hidden">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Paperclip className="h-4 w-4 mr-1" />
            <span className="text-sm">Attachment options</span>
          </Button>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-auto w-full">
        <EmailSection
          title="March"
          emails={marchEmailsWithState}
          onSelectEmail={handleSelectEmail}
          onStarEmail={handleStarEmail}
        />
        <EmailSection
          title="February"
          emails={februaryEmailsWithState}
          onSelectEmail={handleSelectEmail}
          onStarEmail={handleStarEmail}
        />
      </div>
    </div>
  )
}
