import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { Employee, CustomerWithEmployee } from "@/lib/data/me"

// Server-side only: read from process.env (not import.meta.env)
let MEDUSA_BACKEND_URL = "http://localhost:9000"
if (process.env.VITE_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.VITE_MEDUSA_BACKEND_URL
}

let MEDUSA_PUBLISHABLE_KEY = ""
if (process.env.VITE_MEDUSA_PUBLISHABLE_KEY) {
  MEDUSA_PUBLISHABLE_KEY = process.env.VITE_MEDUSA_PUBLISHABLE_KEY
}

export interface SerializableCustomer {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  has_account?: boolean
  metadata?: Record<string, NonNullable<unknown>> | null
  [key: string]: NonNullable<unknown> | null | undefined
}

export interface AuthState {
  isAuthenticated: boolean
  customer: SerializableCustomer | null
  employee: Employee | null
}

/**
 * Forward the incoming request's Cookie header directly to the Medusa backend.
 * The server fn runs on the same server process as the TanStack Start SSR engine,
 * so it can access the raw request cookies via getRequest(). Because the call goes
 * server-to-server (not cross-origin from the browser), the backend processes the
 * session cookie normally regardless of SameSite settings.
 */
async function fetchWithSessionCookie<T>(
  path: string,
  cookieHeader: string
): Promise<T> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      Cookie: cookieHeader,
    },
  })

  if (!response.ok) {
    throw new Error(`${response.status}`)
  }

  return response.json() as Promise<T>
}

export const getServerAuthState = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthState> => {
    const request = getRequest()
    const cookieHeader = request?.headers.get("cookie") ?? ""

    console.log("[getServerAuthState] cookieHeader present:", !!cookieHeader)

    if (!cookieHeader) {
      return { isAuthenticated: false, customer: null, employee: null }
    }

    try {
      const { customer } = await fetchWithSessionCookie<{
        customer: SerializableCustomer
      }>("/store/customers/me", cookieHeader)

      console.log("[getServerAuthState] customer resolved:", customer?.id)

      let employee: Employee | null = null
      try {
        const { customer: customerWithEmployee } =
          await fetchWithSessionCookie<{ customer: CustomerWithEmployee }>(
            "/store/me",
            cookieHeader
          )
        if (customerWithEmployee.employee) {
          employee = customerWithEmployee.employee
        }
      } catch {
        // Not a B2B customer or /store/me endpoint not available
      }

      return { isAuthenticated: true, customer, employee }
    } catch (err) {
      console.log("[getServerAuthState] unauthenticated:", String(err))
      return { isAuthenticated: false, customer: null, employee: null }
    }
  }
)
