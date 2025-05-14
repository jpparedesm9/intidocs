import { Node } from "@tiptap/core"

export const HorizontalRule = Node.create({
  name: "horizontalRule",

  group: "block",

  parseHTML() {
    return [{ tag: "hr" }]
  },

  renderHTML() {
    return ["hr", { class: "horizontal-rule" }]
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain }) => {
          try {
            return chain().insertContent("<hr/>").run()
          } catch (error) {
            console.error("Error inserting horizontal rule:", error)
            return false
          }
        },
    }
  },
})

