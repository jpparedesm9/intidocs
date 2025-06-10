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
    console.log("3. Request body:", { username: body.username, password: "***" })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      console.log("4. Making fetch request to:", fullUrl)

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

      console.log("5. Backend response status:", response.status)
      console.log("6. Backend response ok:", response.ok)
      console.log("7. Backend response headers:", Object.fromEntries(response.headers.entries()))

      // Get the response text first to see what we're dealing with
      const responseText = await response.text()
      console.log("8. Raw response text:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""))

      if (!response.ok) {
        console.error("9. Backend error - Status:", response.status)
        console.error("10. Backend error - Response:", responseText)

        return NextResponse.json(
          {
            error: `Backend server error: ${response.status} ${response.statusText}`,
            details: responseText,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
            responseStatus: response.status,
          },
          { status: response.status },
        )
      }

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("11. Successfully parsed JSON response:", {
          success: data.success,
          hasToken: !!data.data?.token,
          message: data.message,
        })
      } catch (jsonError) {
        console.error("12. Failed to parse JSON response:", jsonError)
        console.error("13. Response was:", responseText)

        return NextResponse.json(
          {
            error: "Backend returned invalid JSON",
            details: `Response was not valid JSON: ${responseText.substring(0, 200)}`,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
            responseStatus: response.status,
            jsonError: jsonError instanceof Error ? jsonError.message : String(jsonError),
          },
          { status: 502 },
        )
      }

      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("14. Request timeout - backend server not responding")
        return NextResponse.json(
          {
            error: "Backend server timeout - server may be down",
            details: `The backend server at ${fullUrl} is not responding within 10 seconds`,
            backendUrl: fullUrl,
            endpoint: LOGIN_ENDPOINT,
          },
          { status: 504 },
        )
      }

      console.error("15. Fetch error details:", {
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

      return NextResponse.json(
        {
          error: "Network error",
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
          backendUrl: fullUrl,
          endpoint: LOGIN_ENDPOINT,
        },
        { status: 500 },
      )
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
  const loginUrl = `${BACKEND_URL}${LOGIN_ENDPOINT}`

  console.log("=== HEALTH CHECK ===")
  console.log("Backend URL:", BACKEND_URL)
  console.log("Login endpoint:", LOGIN_ENDPOINT)
  console.log("Full login URL:", loginUrl)

  try {
    // Try to make a simple GET request to the backend base URL
    const response = await fetch(BACKEND_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("Health check response:", responseText.substring(0, 200))

    return NextResponse.json({
      status: "Proxy is working",
      backendUrl: BACKEND_URL,
      loginEndpoint: LOGIN_ENDPOINT,
      fullLoginUrl: loginUrl,
      backendReachable: response.ok,
      backendStatus: response.status,
      backendResponse: responseText.substring(0, 200),
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
