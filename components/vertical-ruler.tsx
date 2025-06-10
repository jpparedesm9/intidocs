"use client"

import { useMemo, memo } from "react"
import type React from "react"

interface VerticalRulerProps {
  scrollTop: number
}

const VerticalRuler: React.FC<VerticalRulerProps> = memo(({ scrollTop = 0 }) => {
  // Create an array of numbers for the ruler markings (0-20) - memoize to avoid recreation
  const markings = useMemo(() => Array.from({ length: 21 }, (_, i) => i), [])

  // Calculate transform style outside of render
  const transformStyle = useMemo(() => ({
    transform: `translateY(${-(scrollTop % 48)}px)`
  }), [scrollTop])

  return (
    <div className="vertical-ruler w-[40px] bg-[#f1f3f4] border-r border-[#e0e0e0] flex-shrink-0">
      <div className="relative h-full">
        <div className="absolute top-0 left-0 h-full" style={transformStyle}>
          {markings.map((num) => (
            <div key={num} className="flex items-center h-[48px]">
              {/* Number label */}
              <div className="text-[10px] text-gray-600 ml-2 mr-1">{num}</div>

              {/* Major tick */}
              <div className="w-1.5 h-px bg-gray-400"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

VerticalRuler.displayName = "VerticalRuler"

export default VerticalRuler
