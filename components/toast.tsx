"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "destructive"
  onDismiss: (id: string) => void
}

export function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss(id)
    }, 300)
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 max-w-md p-4 rounded-md shadow-lg transition-all duration-300 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        variant === "default" && "bg-white border border-gray-200",
        variant === "success" && "bg-green-50 border border-green-200",
        variant === "destructive" && "bg-red-50 border border-red-200",
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={cn(
              "font-medium text-sm",
              variant === "default" && "text-gray-900",
              variant === "success" && "text-green-800",
              variant === "destructive" && "text-red-800",
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                "text-xs mt-1",
                variant === "default" && "text-gray-500",
                variant === "success" && "text-green-600",
                variant === "destructive" && "text-red-600",
              )}
            >
              {description}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            "ml-4 p-1 rounded-full hover:bg-gray-100",
            variant === "success" && "hover:bg-green-100",
            variant === "destructive" && "hover:bg-red-100",
          )}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Array<{ id: string; title: string; description?: string; variant?: "default" | "success" | "destructive" }>
  dismiss: (id: string) => void
}) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={dismiss}
        />
      ))}
    </>
  )
}

