import { createFileRoute } from "@tanstack/react-router"

// Server-side only
let MEDUSA_BACKEND_URL = "http://localhost:9000"
if (process.env.VITE_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.VITE_MEDUSA_BACKEND_URL
}

const PASSTHROUGH_HEADERS = [
  "content-type",
  "accept",
  "x-publishable-api-key",
  "authorization",
]

async function proxyToMedusa(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // Strip /medusa-api prefix and reconstruct the Medusa URL
  const medusaPath = url.pathname.replace(/^\/medusa-api/, "")
  const medusaUrl = `${MEDUSA_BACKEND_URL}${medusaPath}${url.search}`

  const forwardedHeaders = new Headers()

  for (const header of PASSTHROUGH_HEADERS) {
    const value = request.headers.get(header)
    if (value) {
      forwardedHeaders.set(header, value)
    }
  }

  // Forward browser cookies server-to-server — this bypasses third-party cookie blocking
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    forwardedHeaders.set("cookie", cookieHeader)
  }

  const hasBody =
    request.method !== "GET" && request.method !== "HEAD"
  const body = hasBody ? await request.arrayBuffer() : undefined

  const upstream = await fetch(medusaUrl, {
    method: request.method,
    headers: forwardedHeaders,
    body: body,
    // Do not follow redirects — pass them back to the browser
    redirect: "manual",
  })

  // Build response headers — pass back Set-Cookie so session cookie is stored on
  // the storefront origin (same-origin), making it first-party.
  const responseHeaders = new Headers()
  const allowedResponseHeaders = [
    "content-type",
    "set-cookie",
    "cache-control",
    "etag",
    "last-modified",
    "location",
  ]
  for (const header of allowedResponseHeaders) {
    const value = upstream.headers.get(header)
    if (value) {
      responseHeaders.set(header, value)
    }
  }

  const responseBody = upstream.status === 204 ? null : await upstream.arrayBuffer()

  return new Response(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const Route = createFileRoute("/medusa-api/$")({
  server: {
    handlers: {
      GET: ({ request }) => proxyToMedusa(request),
      POST: ({ request }) => proxyToMedusa(request),
      DELETE: ({ request }) => proxyToMedusa(request),
      OPTIONS: ({ request }) => proxyToMedusa(request),
    },
  },
})
