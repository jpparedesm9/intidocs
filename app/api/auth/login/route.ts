import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = "http://127.0.0.1:8082"
const LOGIN_ENDPOINT = "/api/intdocs/auth/login"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fullUrl = `${BACKEND_URL}${LOGIN_ENDPOINT}`

    console.log("=== LOGIN PROXY DEBUG ===")
    console.log("1. Request received at Next.js API route")
    console.log("2. Target URL:", fullUrl)
    console.log("3. Full URL being called:", fullUrl)
    console.log("4. Request body:", { username: body.username, password: "***" })

    // Verify the URL is correct
    if (!fullUrl.includes("/api/intdocs/auth/login")) {
      console.error("ERROR: Incorrect endpoint URL constructed!")
      return NextResponse.json(
        {
          error: "Internal configuration error",
          details: `Expected URL to contain '/api/intdocs/auth/login' but got: ${fullUrl}`,
        },
        { status: 500 },
      )
    }

    console.log("5. Testing backend connectivity to:", fullUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("6. Backend response status:", response.status)
      console.log("7. Backend response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("8. Backend error response:", errorText)

        return NextResponse.json(
          {
            error: `Backend server error: ${response.status} ${response.statusText}`,
            details: errorText,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
          },
          { status: response.status },
        )
      }

      const data = await response.json()
      console.log("9. Backend success response:", {
        success: data.success,
        hasToken: !!data.data?.token,
        message: data.message,
      })

      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("10. Request timeout - backend server not responding")
        return NextResponse.json(
          {
            error: "Backend server timeout - server may be down",
            details: `The backend server at ${fullUrl} is not responding`,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
          },
          { status: 504 },
        )
      }

      console.error("11. Fetch error details:", {
        name: fetchError instanceof Error ? fetchError.name : "Unknown",
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        cause: fetchError instanceof Error ? fetchError.cause : undefined,
        url: fullUrl,
      })

      // Check if it's a connection refused error
      if (fetchError instanceof Error && fetchError.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          {
            error: "Cannot connect to backend server",
            details: `Backend server at ${fullUrl} is not running or not accessible`,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
            suggestion: "Please ensure the backend server is running on port 8082",
          },
          { status: 503 },
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error("=== PROXY ERROR ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Internal proxy error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        expectedEndpoint: `${BACKEND_URL}${LOGIN_ENDPOINT}`,
      },
      { status: 500 },
    )
  }
}

// Add a GET method for health check
export async function GET() {
  const healthUrl = `${BACKEND_URL}/health`
  const loginUrl = `${BACKEND_URL}${LOGIN_ENDPOINT}`

  console.log("=== HEALTH CHECK ===")
  console.log("Backend URL:", BACKEND_URL)
  console.log("Login endpoint:", LOGIN_ENDPOINT)
  console.log("Full login URL:", loginUrl)

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    return NextResponse.json({
      status: "Proxy is working",
      backendUrl: BACKEND_URL,
      loginEndpoint: LOGIN_ENDPOINT,
      fullLoginUrl: loginUrl,
      backendReachable: response.ok,
      backendStatus: response.status,
    })
  } catch (error) {
    return NextResponse.json({
      status: "Proxy is working, but backend is not reachable",
      backendUrl: BACKEND_URL,
      loginEndpoint: LOGIN_ENDPOINT,
      fullLoginUrl: loginUrl,
      backendReachable: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
