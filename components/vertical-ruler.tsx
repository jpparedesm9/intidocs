"use client"

import type React from "react"

interface VerticalRulerProps {
  scrollTop: number
}

const VerticalRuler: React.FC<VerticalRulerProps> = ({ scrollTop = 0 }) => {
  // Create an array of numbers for the ruler markings (0-11)
  const markings = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="vertical-ruler w-[40px] bg-[#f1f3f4] border-r border-[#e0e0e0] overflow-hidden">
      <div className="absolute top-0 left-0 h-full" style={{ transform: `translateY(${-(scrollTop || 0)}px)` }}>
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
  )
}

export default VerticalRuler

