import { Extension } from "@tiptap/core"

export interface FontFamilyOptions {
  types: string[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontFamily: {
      /**
       * Set the font family
       */
      setFontFamily: (fontFamily: string) => ReturnType
      /**
       * Unset the font family
       */
      unsetFontFamily: () => ReturnType
    }
  }
}

export const FontFamily = Extension.create<FontFamilyOptions>({
  name: "fontFamily",

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
          fontFamily: {
            default: null,
            parseHTML: (element) => element?.style?.fontFamily?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes?.fontFamily) {
                return {}
              }

              return {
                style: `font-family: ${attributes.fontFamily}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { fontFamily }).run()
          } catch (error) {
            console.error("Error setting font family:", error)
            return false
          }
        },
      unsetFontFamily:
        () =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { fontFamily: null }).removeEmptyTextStyle().run()
          } catch (error) {
            console.error("Error unsetting font family:", error)
            return false
          }
        },
    }
  },
})
