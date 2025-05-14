import { Extension } from "@tiptap/core"

export interface TextColorOptions {
  types: string[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      /**
       * Set the text color
       */
      setColor: (color: string) => ReturnType
      /**
       * Unset the text color
       */
      unsetColor: () => ReturnType
    }
  }
}

export const TextColor = Extension.create<TextColorOptions>({
  name: "textColor",

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
          color: {
            default: null,
            parseHTML: (element) => element?.style?.color,
            renderHTML: (attributes) => {
              if (!attributes?.color) {
                return {}
              }

              return {
                style: `color: ${attributes.color}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setColor:
        (color) =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { color }).run()
          } catch (error) {
            console.error("Error setting text color:", error)
            return false
          }
        },
      unsetColor:
        () =>
        ({ chain, commands }) => {
          try {
            return chain().setMark("textStyle", { color: null }).removeEmptyTextStyle().run()
          } catch (error) {
            console.error("Error unsetting text color:", error)
            return false
          }
        },
    }
  },
})

