"use client"
import { Star, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailProps {
  id: number
  sender: string
  subject: string
  preview?: string
  time: string
  read: boolean
  size: string
  isSelected?: boolean
  hasAttachment?: boolean
  isStarred?: boolean
  onSelect: (id: number) => void
  onStar: (id: number) => void
}

export function EmailItem({
  id,
  sender,
  subject,
  preview,
  time,
  read,
  size,
  isSelected = false,
  hasAttachment = false,
  isStarred = false,
  onSelect,
  onStar,
}: EmailProps) {
  return (
    <div
      className={cn(
        "flex items-center px-4 py-2 border-b hover:bg-gray-100 cursor-pointer w-full max-w-full",
        !read && "font-medium",
        isSelected && "bg-blue-50",
      )}
    >
      <div className="flex items-center mr-2 flex-shrink-0">
        <input type="checkbox" className="h-4 w-4 rounded" checked={isSelected} onChange={() => onSelect(id)} />
      </div>
      <div
        className="flex items-center mr-2 flex-shrink-0 cursor-pointer text-gray-400 hover:text-yellow-400"
        onClick={(e) => {
          e.stopPropagation()
          onStar(id)
        }}
      >
        <Star className="h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
      </div>
      <div className="w-[180px] min-w-[120px] max-w-[200px] truncate text-gray-800 mr-2 md:block hidden">{sender}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <div className="md:hidden mr-2 text-sm font-medium truncate w-[100px] min-w-[80px]">{sender}</div>
          <div className="truncate flex-1">
            <span className="mr-1">{subject}</span>
            {preview && <span className="text-gray-500 font-normal hidden md:inline">- {preview}</span>}
          </div>
        </div>
      </div>
      {hasAttachment && (
        <div className="mx-2 text-gray-400 flex-shrink-0">
          <Paperclip className="h-4 w-4" />
        </div>
      )}
      <div className="w-[70px] text-right text-xs text-gray-500 mr-2 hidden md:block flex-shrink-0">{size}</div>
      <div className="w-[100px] lg:w-[180px] text-right text-xs text-gray-500 flex-shrink-0">{time}</div>
    </div>
  )
}

export function EmailSection({ title, emails, onSelectEmail, onStarEmail }) {
  return (
    <div className="border-b">
      <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600">{title}</div>
      {emails.map((email) => (
        <EmailItem key={email.id} {...email} onSelect={onSelectEmail} onStar={onStarEmail} />
      ))}
    </div>
  )
}
