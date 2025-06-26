import { Extension } from "@tiptap/core"

export interface FontSizeOptions {
  types: string[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: string) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

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
          fontSize: {
            default: "12px",
            parseHTML: (element) => element?.style?.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes?.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { fontSize }).run()
          } catch (error) {
            console.error("Error setting font size:", error)
            return false
          }
        },
      unsetFontSize:
        () =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
          } catch (error) {
            console.error("Error unsetting font size:", error)
            return false
          }
        },
    }
  },
})
