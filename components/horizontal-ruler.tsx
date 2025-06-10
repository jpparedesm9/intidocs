"use client"

import { useMemo, memo } from "react"
import type React from "react"

interface HorizontalRulerProps {
  scrollLeft: number
}

const HorizontalRuler: React.FC<HorizontalRulerProps> = memo(({ scrollLeft = 0 }) => {
  // Create an array of numbers for the ruler markings (0-16)
  const markings = useMemo(() => Array.from({ length: 17 }, (_, i) => i), [])
  
  // Pre-generate minor ticks to avoid recreating on each render
  const minorTicks = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="h-1 w-px bg-gray-300"></div>
    )),
  [])

  // Calculate transform style outside of render
  const transformStyle = useMemo(() => ({
    transform: `translateX(${-(scrollLeft % 48)}px)`
  }), [scrollLeft])

  return (
    <div className="horizontal-ruler-container relative h-6 bg-[#f1f3f4] flex border-b border-[#e0e0e0]">
      {/* Left padding for vertical ruler */}
      <div className="w-[40px] h-full border-r border-[#e0e0e0] flex-shrink-0"></div>

      {/* Main ruler area */}
      <div className="horizontal-ruler relative flex-1 h-full overflow-hidden">
        <div className="absolute inset-0 flex justify-center">
          <div className="relative flex items-end h-full" style={transformStyle}>
            {markings.map((num) => (
              <div key={num} className="flex flex-col items-center" style={{ width: "48px" }}>
                {/* Number label */}
                <div className="text-[10px] text-gray-600 mb-0.5">{num}</div>

                {/* Major tick */}
                <div className="h-1.5 w-px bg-gray-400"></div>

                {/* Minor ticks */}
                <div className="flex justify-between w-full px-0.5">
                  {minorTicks}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

HorizontalRuler.displayName = "HorizontalRuler"

export default HorizontalRuler
