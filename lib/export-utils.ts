"use client"

// Helper function to convert HTML to plain text
function htmlToPlainText(html: string): string {
  if (typeof window === "undefined") return ""

  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ""
}

// Let's completely rewrite the PDF export function to ensure it properly matches the editor view

// Replace the entire exportToPDF function with this improved version:

// Export to PDF
export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.style.position = "fixed"
    loadingIndicator.style.top = "0"
    loadingIndicator.style.left = "0"
    loadingIndicator.style.width = "100%"
    loadingIndicator.style.height = "100%"
    loadingIndicator.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
    loadingIndicator.style.display = "flex"
    loadingIndicator.style.justifyContent = "center"
    loadingIndicator.style.alignItems = "center"
    loadingIndicator.style.zIndex = "9999"
    loadingIndicator.innerHTML = "<div>Generating PDF...</div>"
    document.body.appendChild(loadingIndicator)

    try {
      // Dynamically import html2canvas and jsPDF
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default

      const jsPDFModule = await import("jspdf")
      const { jsPDF } = jsPDFModule

      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement

      // Create a wrapper with exact dimensions of a letter page
      const wrapper = document.createElement("div")
      wrapper.style.position = "absolute"
      wrapper.style.left = "-9999px"
      wrapper.style.top = "0"
      wrapper.style.width = "8.5in"
      wrapper.style.height = "11in"
      wrapper.style.backgroundColor = "white"
      document.body.appendChild(wrapper)

      // Prepare the content for PDF rendering
      const contentDiv = document.createElement("div")
      contentDiv.style.position = "relative"
      contentDiv.style.width = "100%"
      contentDiv.style.height = "100%"
      contentDiv.style.overflow = "hidden"

      // Copy the content without the extra margins/padding
      // Remove any page-container specific styling that might add margins
      const content = clone as HTMLElement

      // Remove any borders or extra padding from tables and other elements
      const tables = content.querySelectorAll("table")
      tables.forEach((table) => {
        table.style.width = "100%"
        table.style.borderCollapse = "collapse"
      })

      // Copy the inner content to our wrapper
      contentDiv.innerHTML = content.innerHTML
      wrapper.appendChild(contentDiv)

      // Get all images in the content
      const images = contentDiv.querySelectorAll("img")

      // Process images to avoid CORS issues
      const imagePromises = Array.from(images).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.src.startsWith("data:")) {
            resolve()
            return
          }

          const newImg = new Image()
          newImg.crossOrigin = "anonymous"

          newImg.onload = () => {
            try {
              const canvas = document.createElement("canvas")
              canvas.width = newImg.naturalWidth || 200
              canvas.height = newImg.naturalHeight || 100

              const ctx = canvas.getContext("2d")
              if (ctx) {
                ctx.drawImage(newImg, 0, 0)
                img.src = canvas.toDataURL("image/png")
              }
            } catch (e) {
              console.error("Error converting image:", e)
            }
            resolve()
          }

          newImg.onerror = () => {
            console.warn("Failed to load image:", img.src)
            resolve()
          }

          newImg.src = img.src

          setTimeout(() => {
            if (!newImg.complete) {
              console.warn("Image load timed out:", img.src)
              resolve()
            }
          }, 3000)
        })
      })

      // Wait for all images to be processed
      await Promise.all(imagePromises)

      // Render to canvas
      const canvas = await html2canvas(wrapper, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // Create PDF with letter dimensions (8.5x11 inches)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      })

      // Add the canvas image to the PDF - use full page dimensions
      const imgData = canvas.toDataURL("image/jpeg", 0.95)
      pdf.addImage(imgData, "JPEG", 0, 0, 8.5, 11)

      // Clean up
      document.body.removeChild(wrapper)

      // Save PDF
      pdf.save(`${filename || "document"}.pdf`)
    } finally {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator)
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    throw error
  }
}

// Export to DOCX
export async function exportToDOCX(html: string, filename: string): Promise<void> {
  try {
    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.style.position = "fixed"
    loadingIndicator.style.top = "0"
    loadingIndicator.style.left = "0"
    loadingIndicator.style.width = "100%"
    loadingIndicator.style.height = "100%"
    loadingIndicator.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
    loadingIndicator.style.display = "flex"
    loadingIndicator.style.justifyContent = "center"
    loadingIndicator.style.alignItems = "center"
    loadingIndicator.style.zIndex = "9999"
    loadingIndicator.innerHTML = "<div>Generating DOCX...</div>"
    document.body.appendChild(loadingIndicator)

    try {
      // Dynamically import docx and file-saver
      const docxModule = await import("docx")
      const {
        Document,
        Paragraph,
        TextRun,
        HeadingLevel,
        Table,
        TableRow,
        TableCell,
        BorderStyle,
        Packer,
        ImageRun,
        AlignmentType,
        convertInchesToTwip,
      } = docxModule

      // For file-saver, we need to handle it differently since it's a CommonJS module
      const fileSaverModule = await import("file-saver")
      const saveAs = fileSaverModule.default || fileSaverModule.saveAs
      if (typeof saveAs !== "function") {
        console.error("saveAs is not available as expected", fileSaverModule)
        throw new Error("saveAs function not available")
      }

      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = html

      // Create a temporary container in the DOM to load images
      const imageContainer = document.createElement("div")
      imageContainer.style.position = "absolute"
      imageContainer.style.left = "-9999px"
      imageContainer.style.top = "0"
      document.body.appendChild(imageContainer)

      // Process all images in the HTML to convert them to base64
      const imgElements = tempDiv.querySelectorAll("img")
      const imagePromises = Array.from(imgElements).map(async (imgElement, index) => {
        const img = imgElement as HTMLImageElement
        if (!img.src) return

        try {
          // Skip if it's already a data URL
          if (img.src.startsWith("data:")) {
            return
          }

          // Create a new image element in the DOM
          const newImg = document.createElement("img")
          newImg.crossOrigin = "anonymous"
          imageContainer.appendChild(newImg)

          // Wait for the image to load
          await new Promise<void>((resolve) => {
            newImg.onload = () => {
              try {
                // Create a canvas to draw the image
                const canvas = document.createElement("canvas")
                canvas.width = newImg.naturalWidth || 200
                canvas.height = newImg.naturalHeight || 100

                // Draw the image to canvas
                const ctx = canvas.getContext("2d")
                if (ctx) {
                  ctx.drawImage(newImg, 0, 0)
                  // Store the data URL as an attribute
                  img.setAttribute("data-base64", canvas.toDataURL("image/png"))
                }
              } catch (e) {
                console.error("Error converting image to base64:", e)
                createDocxImagePlaceholder(img)
              }
              resolve()
            }

            newImg.onerror = () => {
              console.warn("Failed to load image:", img.src)
              createDocxImagePlaceholder(img)
              resolve()
            }

            // Start loading the image
            newImg.src = img.src

            // Set a timeout in case the image takes too long
            setTimeout(() => {
              if (!newImg.complete) {
                console.warn("Image load timed out:", img.src)
                createDocxImagePlaceholder(img)
                resolve()
              }
            }, 3000)
          })
        } catch (e) {
          console.error("Error processing image:", e)
          createDocxImagePlaceholder(img)
        }
      })

      // Helper function to create a placeholder for failed images in DOCX
      function createDocxImagePlaceholder(img) {
        try {
          const canvas = document.createElement("canvas")
          const width = img.width || img.naturalWidth || 200
          const height = img.height || img.naturalHeight || 100
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (ctx) {
            // Fill with light gray background
            ctx.fillStyle = "#f0f0f0"
            ctx.fillRect(0, 0, width, height)

            // Add a border
            ctx.strokeStyle = "#cccccc"
            ctx.lineWidth = 2
            ctx.strokeRect(2, 2, width - 4, height - 4)

            // Add text
            ctx.fillStyle = "#666666"
            ctx.font = `${Math.max(12, Math.min(16, width / 15))}px Arial`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("Image not available", width / 2, height / 2)

            // Set the data-base64 attribute
            img.setAttribute("data-base64", canvas.toDataURL("image/png"))
          }
        } catch (e) {
          console.error("Error creating placeholder:", e)
        }
      }

      // Wait for all images to be processed
      await Promise.all(imagePromises)

      // Clean up the image container
      document.body.removeChild(imageContainer)

      // Create an array to store all document elements in order
      const documentElements: any[] = []

      // Helper function to sanitize text for DOCX
      function sanitizeText(text: string): string {
        if (!text) return ""
        // Replace special characters that might cause issues
        return text
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "") // Remove control characters
          .replace(/[\uD800-\uDFFF]/g, "") // Remove surrogate pairs
      }

      // Process all elements in order
      const processNode = async (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Skip empty text nodes or nodes that are part of elements we'll process separately
          const parentElement = node.parentElement
          if (
            node.textContent?.trim() &&
            parentElement &&
            !["H1", "H2", "H3", "H4", "H5", "H6", "P"].includes(parentElement.tagName)
          ) {
            documentElements.push(
              new Paragraph({
                children: [new TextRun({ text: sanitizeText(node.textContent) })],
              }),
            )
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement

          // Process different element types
          switch (element.tagName.toLowerCase()) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
              const level = Number.parseInt(element.tagName.substring(1))
              let headingLevel
              switch (level) {
                case 1:
                  headingLevel = HeadingLevel.HEADING_1
                  break
                case 2:
                  headingLevel = HeadingLevel.HEADING_2
                  break
                case 3:
                  headingLevel = HeadingLevel.HEADING_3
                  break
                case 4:
                  headingLevel = HeadingLevel.HEADING_4
                  break
                case 5:
                  headingLevel = HeadingLevel.HEADING_5
                  break
                case 6:
                  headingLevel = HeadingLevel.HEADING_6
                  break
                default:
                  headingLevel = HeadingLevel.HEADING_1
              }

              // Get text alignment
              let alignment = AlignmentType.LEFT
              const textAlign = element.style.textAlign
              if (textAlign === "center") alignment = AlignmentType.CENTER
              if (textAlign === "right") alignment = AlignmentType.RIGHT
              if (textAlign === "justify") alignment = AlignmentType.JUSTIFIED

              documentElements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sanitizeText(element.textContent || ""),
                      bold: true,
                      size: (7 - level) * 4, // Larger size for higher level headings
                    }),
                  ],
                  heading: headingLevel,
                  alignment,
                }),
              )
              break

            case "p":
              // Get text alignment
              let pAlignment = AlignmentType.LEFT
              const pTextAlign = element.style.textAlign
              if (pTextAlign === "center") pAlignment = AlignmentType.CENTER
              if (pTextAlign === "right") pAlignment = AlignmentType.RIGHT
              if (pTextAlign === "justify") pAlignment = AlignmentType.JUSTIFIED

              documentElements.push(
                new Paragraph({
                  children: [new TextRun({ text: sanitizeText(element.textContent || "") })],
                  alignment: pAlignment,
                }),
              )
              break

            case "img":
              try {
                const imgElement = element as HTMLImageElement
                const base64Data = imgElement.getAttribute("data-base64") || imgElement.src

                if (base64Data && base64Data.includes("base64")) {
                  // Extract base64 data without the prefix
                  const base64Image = base64Data.split(",")[1]

                  if (base64Image) {
                    // Calculate image dimensions (with max width constraint)
                    const maxWidth = 500 // Max width in pixels
                    let width = imgElement.width || 200
                    let height = imgElement.height || 100

                    if (width > maxWidth) {
                      const ratio = height / width
                      width = maxWidth
                      height = Math.round(width * ratio)
                    }

                    // Add image to document
                    try {
                      const imageBuffer = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0))

                      // Add a simple paragraph before the image to improve compatibility
                      documentElements.push(new Paragraph({ text: "" }))

                      // Add the image with simplified properties
                      documentElements.push(
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: imageBuffer,
                              transformation: {
                                width,
                                height,
                              },
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      )

                      // Add a simple paragraph after the image to improve compatibility
                      documentElements.push(new Paragraph({ text: "" }))

                      console.log(`Added image: ${width}x${height}`)
                    } catch (e) {
                      console.error("Error creating ImageRun:", e)
                    }
                  }
                }
              } catch (error) {
                console.error("Error processing image for DOCX:", error)
              }
              break

            case "table":
              try {
                const rows = element.querySelectorAll("tr")
                if (rows.length === 0) break

                const tableRows = []

                for (let i = 0; i < rows.length; i++) {
                  const row = rows[i]
                  const cells = row.querySelectorAll("td, th")

                  if (cells.length === 0) continue

                  const tableCells = []

                  for (let j = 0; j < cells.length; j++) {
                    const cell = cells[j]
                    const isHeader = cell.tagName.toLowerCase() === "th"

                    tableCells.push(
                      new TableCell({
                        children: [new Paragraph({ text: sanitizeText(cell.textContent || "") })],
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 1 },
                          bottom: { style: BorderStyle.SINGLE, size: 1 },
                          left: { style: BorderStyle.SINGLE, size: 1 },
                          right: { style: BorderStyle.SINGLE, size: 1 },
                        },
                        shading: isHeader ? { fill: "EEEEEE" } : undefined,
                      }),
                    )
                  }

                  tableRows.push(new TableRow({ children: tableCells }))
                }

                if (tableRows.length > 0) {
                  documentElements.push(
                    new Table({
                      rows: tableRows,
                      width: {
                        size: 100,
                        type: docxModule.WidthType.PERCENTAGE,
                      },
                    }),
                  )

                  // Add a paragraph after the table for better spacing
                  documentElements.push(new Paragraph({ text: "" }))
                }
              } catch (error) {
                console.error("Error processing table for DOCX:", error)
              }
              break

            case "hr":
              // Add a horizontal line as a paragraph with border-top
              documentElements.push(
                new Paragraph({
                  text: "",
                  border: {
                    top: {
                      color: "auto",
                      space: 1,
                      style: BorderStyle.SINGLE,
                      size: 1,
                    },
                  },
                }),
              )
              break

            default:
              // For other elements, process their children
              for (let i = 0; i < element.childNodes.length; i++) {
                await processNode(element.childNodes[i])
              }
          }
        }
      }

      // Process all nodes in the document
      for (let i = 0; i < tempDiv.childNodes.length; i++) {
        await processNode(tempDiv.childNodes[i])
      }

      // Create document with simplified structure and borders
      const doc = new Document({
        compatibility: {
          doNotExpandShiftReturn: true,
          useNormalStyleForList: true,
          doNotUseIndentAsNumberingTabStop: true,
        },
        features: {
          updateFields: true,
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(1), // 1 inch in twips
                  right: convertInchesToTwip(1),
                  bottom: convertInchesToTwip(1),
                  left: convertInchesToTwip(1),
                },
                borders: {
                  pageBorderTop: {
                    style: BorderStyle.SINGLE,
                    size: 12, // 1 point
                    color: "000000",
                    space: 24, // 2 points
                  },
                  pageBorderRight: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: "000000",
                    space: 24,
                  },
                  pageBorderBottom: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: "000000",
                    space: 24,
                  },
                  pageBorderLeft: {
                    style: BorderStyle.SINGLE,
                    size: 12,
                    color: "000000",
                    space: 24,
                  },
                  pageBorders: {
                    display: true,
                    offsetFrom: docxModule.PageBorderOffsetFrom.PAGE,
                    zOrder: docxModule.PageBorderZOrder.FRONT,
                  },
                },
              },
            },
            children: documentElements,
          },
        ],
      })

      // Generate and save document
      const buffer = await Packer.toBuffer(doc)
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      saveAs(blob, `${filename || "document"}.docx`)
    } finally {
      // Remove loading indicator
      document.body.removeChild(loadingIndicator)
    }
  } catch (error) {
    console.error("Error exporting to DOCX:", error)
    throw error
  }
}

// Export to HTML
export async function exportToHTML(html: string, filename: string): Promise<void> {
  try {
    // Dynamically import file-saver
    const fileSaverModule = await import("file-saver")
    const saveAs = fileSaverModule.default || fileSaverModule.saveAs
    if (typeof saveAs !== "function") {
      console.error("saveAs is not available as expected", fileSaverModule)
      throw new Error("saveAs function not available")
    }

    const blob = new Blob(
      [
        `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            margin: 1in;
            line-height: 1.5;
          }
          .document-content {
            border: 1px solid #000;
            padding: 0.5in;
            min-height: 9in;
          }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #ddd; padding: 8px; }
          hr { border: none; border-top: 1px solid #000; margin: 1em 0; }
          .horizontal-rule { border-top: 1px solid #000; margin: 1em 0; }
          h1, h2, h3 { margin-top: 1em; margin-bottom: 0.5em; }
          p { margin-bottom: 0.5em; }
        </style>
      </head>
      <body>
        <div class="document-content">
          ${html}
        </div>
      </body>
      </html>
    `,
      ],
      { type: "text/html" },
    )

    saveAs(blob, `${filename || "document"}.html`)
  } catch (error) {
    console.error("Error exporting to HTML:", error)
    throw error
  }
}
