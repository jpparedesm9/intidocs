import { Extension } from "@tiptap/core"
import type { Node as ProseMirrorNode } from "prosemirror-model"
import { Plugin, PluginKey } from "prosemirror-state"
import { Decoration, DecorationSet } from "prosemirror-view"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType
    }
  }
}

export const PageBreak = Extension.create({
  name: "pageBreak",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          "data-page-break": {
            default: null,
            parseHTML: (element) => element.getAttribute("data-page-break"),
            renderHTML: (attributes) => {
              if (!attributes["data-page-break"]) {
                return {}
              }

              return { "data-page-break": attributes["data-page-break"] }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: "paragraph", attrs: { "data-page-break": "true" } })
            .run()
        },
    }
  },

  addProseMirrorPlugins() {
    const key = new PluginKey("pageBreak")

    return [
      new Plugin({
        key,
        props: {
          decorations(state) {
            if (!state || !state.doc) return DecorationSet.empty

            const { doc } = state
            const decorations: Decoration[] = []

            doc.descendants((node: ProseMirrorNode, pos: number) => {
              // Add null checks to prevent the error
              if (
                node &&
                node.type &&
                node.type.name === "paragraph" &&
                node.attrs &&
                node.attrs["data-page-break"] === "true"
              ) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "page-break",
                  }),
                )
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})

