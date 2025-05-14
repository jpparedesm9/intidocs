"use client"

import type React from "react"

interface BottomRulerProps {
  scrollLeft: number
}

const BottomRuler: React.FC<BottomRulerProps> = ({ scrollLeft = 0 }) => {
  // Create an array of numbers for the ruler markings (0-16)
  const markings = Array.from({ length: 17 }, (_, i) => i)

  return (
    <div className="bottom-ruler-container relative h-6 bg-[#f1f3f4] flex border-t border-[#e0e0e0]">
      {/* Left padding for vertical ruler */}
      <div className="w-[40px] h-full border-r border-[#e0e0e0]"></div>

      {/* Main ruler area - centered to match page */}
      <div className="bottom-ruler relative flex-1 h-full overflow-hidden flex justify-center">
        <div
          className="w-[816px] relative flex items-start h-full"
          style={{ transform: `translateX(${-(scrollLeft || 0)}px)` }}
        >
          <div className="flex items-start h-full">
            {markings.map((num) => (
              <div key={num} className="flex flex-col items-center" style={{ width: "48px" }}>
                {/* Major tick */}
                <div className="h-1.5 w-px bg-gray-400 mt-1"></div>

                {/* Number label */}
                <div className="text-[10px] text-gray-600 mt-0.5">{num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomRuler
