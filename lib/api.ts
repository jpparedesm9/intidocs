const BACKEND_BASE_URL = "http://127.0.0.1:8082"

export class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    if (typeof window !== "undefined") {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}")
      if (auth.token) {
        return {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      }
    }
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  // Interceptor para todas las requests
  private async interceptRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BACKEND_BASE_URL}${endpoint}`

    // Obtener token actual
    const authHeaders = this.getAuthHeaders()

    const config: RequestInit = {
      ...options,
      mode: "cors",
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    }

    console.log("🚀 API Request Intercepted:", {
      url,
      method: config.method || "GET",
      headers: config.headers,
      hasToken: authHeaders.Authorization ? "✅ Yes" : "❌ No",
    })

    try {
      const response = await fetch(url, config)

      console.log("📡 API Response:", {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.warn("🔒 Token expired or invalid, redirecting to login")
          // Token expired or invalid, redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth")
            window.location.href = "/login"
          }
          throw new Error("Session expired")
        }

        const errorText = await response.text()
        console.error("❌ API Error Response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const responseText = await response.text()
      console.log("✅ API Success Response:", responseText.substring(0, 200) + "...")

      return JSON.parse(responseText)
    } catch (error) {
      console.error("💥 API request failed:", error)
      throw error
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.interceptRequest<T>(endpoint, options)
  }

  // Document endpoints - todos van a 127.0.0.1:8082/api/intdocs/documents
  async createDocument(data: { subject: string; tags?: string[] }) {
    console.log("📝 Creating document:", data)
    return this.request("/api/intdocs/documents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getDocument(documentId: string | number) {
    console.log("📄 Getting document:", documentId)
    return this.request(`/api/intdocs/documents/${documentId}`)
  }

  async updateDocument(documentId: string | number, data: any) {
    console.log("✏️ Updating document:", documentId, data)
    return this.request(`/api/intdocs/documents/${documentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteDocument(documentId: string | number) {
    console.log("🗑️ Deleting document:", documentId)
    return this.request(`/api/intdocs/documents/${documentId}`, {
      method: "DELETE",
    })
  }

  async getAllDocuments() {
    console.log("📚 Getting all documents")
    return this.request("/api/intdocs/documents")
  }

  // Método para verificar si el token es válido
  async verifyToken(): Promise<boolean> {
    try {
      await this.request("/api/intdocs/auth/verify")
      return true
    } catch (error) {
      console.warn("Token verification failed:", error)
      return false
    }
  }

  // Document Users endpoints - CORREGIDO para usar GET explícitamente
  async searchDocumentUsers(query = "", page = 0, size = 20) {
    console.log("🔍 Searching document users:", { query, page, size })

    // Verificar que tenemos el token antes de hacer la request
    const authHeaders = this.getAuthHeaders()
    console.log("🔑 Auth headers for search:", authHeaders)

    if (!authHeaders.Authorization) {
      console.warn("⚠️ No authorization token found for document users search")
    }

    // Construir URL con parámetros de query
    const searchParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      q: query,
    })

    const endpoint = `/document-users/search?${searchParams.toString()}`
    console.log("🌐 Final endpoint:", endpoint)

    // Usar GET explícitamente y sin Content-Type para evitar preflight OPTIONS
    return this.request(endpoint, {
      method: "GET",
      headers: {
        Authorization: authHeaders.Authorization || "",
        Accept: "application/json",
      },
    })
  }
}

export const apiClient = new ApiClient()
