import { Extension } from "@tiptap/core"

export interface HighlightOptions {
  types: string[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Set the highlight color
       */
      setHighlight: (attributes: { color: string }) => ReturnType
      /**
       * Unset the highlight color
       */
      unsetHighlight: () => ReturnType
    }
  }
}

export const Highlight = Extension.create<HighlightOptions>({
  name: "highlight",

  addOptions() {
    return {
      types: ["textStyle"],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element?.style?.backgroundColor,
            renderHTML: (attributes) => {
              if (!attributes?.backgroundColor) {
                return {}
              }

              return {
                style: `background-color: ${attributes.backgroundColor}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setHighlight:
        (attributes) =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { backgroundColor: attributes.color }).run()
          } catch (error) {
            console.error("Error setting highlight:", error)
            return false
          }
        },
      unsetHighlight:
        () =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { backgroundColor: null }).removeEmptyTextStyle().run()
          } catch (error) {
            console.error("Error unsetting highlight:", error)
            return false
          }
        },
    }
  },
})
