/**
 * Replaces template placeholders with actual data
 * @param template HTML template string with placeholders in {{placeholder}} format
 * @param data Object containing key-value pairs to replace placeholders
 * @returns Processed HTML with placeholders replaced by actual data
 */
export function processTemplate(template: string, data: Record<string, string | number>): string {
  // Replace all placeholders with corresponding data
  let processedTemplate = template

  // Find all placeholders in the template
  const placeholderRegex = /\{\{([^}]+)\}\}/g
  const placeholders = [...template.matchAll(placeholderRegex)].map((match) => match[1])

  // Replace each placeholder with its value from the data object
  placeholders.forEach((placeholder) => {
    const value = data[placeholder] !== undefined ? data[placeholder] : `{{${placeholder}}}`
    processedTemplate = processedTemplate.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"), String(value))
  })

  return processedTemplate
}

/**
 * Extracts all placeholders from a template
 * @param template HTML template string with placeholders in {{placeholder}} format
 * @returns Array of placeholder names without the curly braces
 */
export function extractPlaceholders(template: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g
  const placeholders = [...template.matchAll(placeholderRegex)].map((match) => match[1])
  return [...new Set(placeholders)] // Remove duplicates
}

/**
 * Creates a form for filling in template data
 * @param placeholders Array of placeholder names
 * @returns Object with form fields and default values
 */
export function createTemplateForm(placeholders: string[]): Record<string, string> {
  const formData: Record<string, string> = {}

  placeholders.forEach((placeholder) => {
    // Convert camelCase or snake_case to Title Case with spaces
    const label = placeholder
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter

    formData[placeholder] = "" // Initialize with empty string
  })

  return formData
}
