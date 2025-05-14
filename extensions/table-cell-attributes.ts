import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "prosemirror-state"
import { type Decoration, DecorationSet } from "prosemirror-view"

export interface TableCellAttributesOptions {
  // Default table cell attributes
  backgroundColor: {
    default: null
    parseHTML: (element: HTMLElement) => string | null
    renderHTML: (attributes: Record<string, any>) => Record<string, any>
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableCellAttributes: {
      setCellAttribute: (attributeName: string, value: any) => ReturnType
    }
  }
}

export const TableCellAttributes = Extension.create<TableCellAttributesOptions>({
  name: "tableCellAttributes",

  addOptions() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: (element) =>
          element?.getAttribute("data-background-color") || element?.style?.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes?.backgroundColor) {
            return {}
          }

          return {
            "data-background-color": attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: ["tableCell", "tableHeader"],
        attributes: {
          backgroundColor: {
            default: this.options.backgroundColor.default,
            parseHTML: this.options.backgroundColor.parseHTML,
            renderHTML: this.options.backgroundColor.renderHTML,
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setCellAttribute:
        (attributeName, value) =>
        ({ editor, tr }) => {
          if (!editor || !tr) return false

          const { selection } = tr
          if (!selection) return false

          try {
            // Check if it's a table selection
            if (selection.isTableSelection) {
              tr.setCellAttribute(attributeName, value)
              return true
            }

            // If not a table selection, check if we're in a table cell
            const nodeType = selection.$anchor?.node()?.type?.name
            if (nodeType === "tableCell" || nodeType === "tableHeader") {
              tr.setCellAttribute(attributeName, value)
              return true
            }

            return false
          } catch (error) {
            console.error("Error in setCellAttribute:", error)
            return false
          }
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("tableCellAttributes"),
        props: {
          decorations(state) {
            if (!state || !state.doc) return DecorationSet.empty

            const { doc, selection } = state
            const decorations: Decoration[] = []

            try {
              // Only proceed if we have a valid selection
              if (selection && selection.$anchor) {
                // Add decorations if needed
              }
            } catch (error) {
              console.error("Error in tableCellAttributes plugin:", error)
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

