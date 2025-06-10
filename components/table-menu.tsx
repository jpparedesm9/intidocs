"use client"

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import type { Editor } from "@tiptap/react"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { TableIcon, Plus, Trash, Merge, Split, Grid, PaintBucket } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableMenuProps {
  editor: Editor
}

const TableMenu = memo(function TableMenu({ editor }: TableMenuProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  const maxRows = 8
  const maxCols = 10

  // Safely check if table is selected - memoize this to prevent unnecessary calculations
  const isTableSelected = useMemo(() => {
    return editor && editor.isActive ? editor.isActive("table") : false
  }, [editor])

  const handleCreateTable = useCallback((rows: number, cols: number) => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
        setIsTableMenuOpen(false)
      }
    } catch (error) {
      console.error("Error creating table:", error)
    }
  }, [editor, setIsTableMenuOpen])

  const handleAddRowBefore = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().addRowBefore().run()
      }
    } catch (error) {
      console.error("Error adding row before:", error)
    }
  }

  const handleAddRowAfter = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().addRowAfter().run()
      }
    } catch (error) {
      console.error("Error adding row after:", error)
    }
  }

  const handleAddColumnBefore = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().addColumnBefore().run()
      }
    } catch (error) {
      console.error("Error adding column before:", error)
    }
  }

  const handleAddColumnAfter = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().addColumnAfter().run()
      }
    } catch (error) {
      console.error("Error adding column after:", error)
    }
  }

  const handleDeleteRow = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().deleteRow().run()
      }
    } catch (error) {
      console.error("Error deleting row:", error)
    }
  }

  const handleDeleteColumn = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().deleteColumn().run()
      }
    } catch (error) {
      console.error("Error deleting column:", error)
    }
  }

  const handleDeleteTable = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().deleteTable().run()
      }
    } catch (error) {
      console.error("Error deleting table:", error)
    }
  }

  const handleMergeCells = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().mergeCells().run()
      }
    } catch (error) {
      console.error("Error merging cells:", error)
    }
  }

  const handleSplitCell = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().splitCell().run()
      }
    } catch (error) {
      console.error("Error splitting cell:", error)
    }
  }

  const handleToggleHeaderRow = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().toggleHeaderRow().run()
      }
    } catch (error) {
      console.error("Error toggling header row:", error)
    }
  }

  const handleToggleHeaderColumn = () => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().toggleHeaderColumn().run()
      }
    } catch (error) {
      console.error("Error toggling header column:", error)
    }
  }

  const handleSetCellBackground = (color: string) => {
    try {
      if (editor && editor.chain) {
        editor.chain().focus().setCellAttribute("backgroundColor", color).run()
        setIsColorPickerOpen(false)
      }
    } catch (error) {
      console.error("Error setting cell background:", error)
    }
  }

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const colors = useMemo(() => [
    "#ffffff",
    "#f5f5f5",
    "#e0e0e0",
    "#bdbdbd",
    "#ffcdd2",
    "#f8bbd0",
    "#e1bee7",
    "#d1c4e9",
    "#bbdefb",
    "#b3e5fc",
    "#b2ebf2",
    "#b2dfdb",
    "#c8e6c9",
    "#dcedc8",
    "#f0f4c3",
    "#fff9c4",
    "#ffecb3",
    "#ffe0b2",
    "#ffccbc",
    "#d7ccc8",
  ], [])

  // If editor is not available, don't render anything
  if (!editor) return null
  
  // Memoize the table grid for better performance
  const tableGrid = useMemo(() => {
    return Array.from({ length: maxRows * maxCols }).map((_, index) => {
      const row = Math.floor(index / maxCols)
      const col = index % maxCols
      const isHighlighted = hoveredCell !== null && row <= hoveredCell.row && col <= hoveredCell.col

      return (
        <div
          key={index}
          className={cn(
            "w-6 h-6 border border-gray-200 rounded-sm transition-colors",
            isHighlighted ? "bg-blue-100" : "bg-gray-50",
          )}
          onMouseEnter={() => setHoveredCell({ row, col })}
          onClick={() => handleCreateTable(row + 1, col + 1)}
        />
      )
    })
  }, [hoveredCell, maxCols, handleCreateTable, maxRows])

  return (
    <>
      <Popover open={isTableMenuOpen} onOpenChange={setIsTableMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" title="Table" className={isTableSelected ? "bg-gray-200" : ""}>
            <TableIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {!isTableSelected ? (
            <div className="p-2">
              <div className="text-sm font-medium mb-2 px-2 pt-2">Insert Table</div>
              <div className="grid grid-cols-10 gap-1 p-2 bg-white rounded-md">
                {tableGrid}
              </div>
              {hoveredCell && (
                <div className="text-center text-sm py-2">
                  {hoveredCell.col + 1} x {hoveredCell.row + 1}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={handleAddRowBefore}>
                  <Plus className="h-4 w-4 mr-2" />
                  Row above
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleAddRowAfter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Row below
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleAddColumnBefore}>
                  <Plus className="h-4 w-4 mr-2" />
                  Column left
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleAddColumnAfter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Column right
                </Button>
              </div>

              <DropdownMenuSeparator className="my-2" />

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={handleDeleteRow}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete row
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleDeleteColumn}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete column
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-red-600 hover:text-red-700"
                  onClick={handleDeleteTable}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete table
                </Button>
              </div>

              <DropdownMenuSeparator className="my-2" />

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={handleMergeCells}>
                  <Merge className="h-4 w-4 mr-2" />
                  Merge cells
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleSplitCell}>
                  <Split className="h-4 w-4 mr-2" />
                  Split cell
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleToggleHeaderRow}>
                  <Grid className="h-4 w-4 mr-2" />
                  Toggle header row
                </Button>
                <Button variant="outline" size="sm" className="justify-start" onClick={handleToggleHeaderColumn}>
                  <Grid className="h-4 w-4 mr-2" />
                  Toggle header column
                </Button>
              </div>

              <DropdownMenuSeparator className="my-2" />

              <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start w-full">
                    <PaintBucket className="h-4 w-4 mr-2" />
                    Cell background
                  </Button>
                </PopoverTrigger>
                <PopoverContent ref={colorPickerRef} className="w-auto p-2" align="start">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-sm border border-gray-300"
                        style={{ backgroundColor: color }}
                        onClick={() => handleSetCellBackground(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  )
})

TableMenu.displayName = "TableMenu"

export default TableMenu
