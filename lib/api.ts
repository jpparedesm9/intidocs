const API_BASE_URL = "/api" // Usar rutas API de Next.js como proxy

export class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    if (typeof window !== "undefined") {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}")
      if (auth.token) {
        return {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        }
      }
    }
    return {
      "Content-Type": "application/json",
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth")
            window.location.href = "/login"
          }
          throw new Error("Session expired")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Document endpoints
  async createDocument(data: { subject: string; tags: string[] }) {
    return this.request("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getDocument(documentId: string) {
    return this.request(`/documents/${documentId}`)
  }

  async updateDocument(documentId: string, data: any) {
    return this.request(`/documents/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()
