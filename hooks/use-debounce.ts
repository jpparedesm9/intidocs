"use client"

import { useCallback, useRef, useEffect } from "react"

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<T>(callback) // Store the callback in a ref to avoid recreating the debounced function

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (callbackRef.current) {
          callbackRef.current(...args)
        }
      }, delay)
    },
    [delay], // Only depend on delay, not on the callback
  )

  return debouncedCallback
}
