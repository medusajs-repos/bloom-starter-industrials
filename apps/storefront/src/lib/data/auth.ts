import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { Employee, CustomerWithEmployee } from "@/lib/data/me"

let MEDUSA_BACKEND_URL = "http://localhost:9000"
if (process.env.VITE_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.VITE_MEDUSA_BACKEND_URL
}

let MEDUSA_PUBLISHABLE_KEY = ""
if (process.env.VITE_MEDUSA_PUBLISHABLE_KEY) {
  MEDUSA_PUBLISHABLE_KEY = process.env.VITE_MEDUSA_PUBLISHABLE_KEY
}

// The cookie name we use to persist the Medusa JWT for SSR auth resolution.
// This is written by auth-context.tsx on the client after login/logout.
export const MEDUSA_JWT_COOKIE = "_medusa_jwt"

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

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    cookies[key] = decodeURIComponent(value)
  }
  return cookies
}

async function fetchWithBearer<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`${response.status}`)
  }

  return response.json() as Promise<T>
}

export const getServerAuthState = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest()
    const cookieHeader = request?.headers.get("cookie") ?? ""

    if (!cookieHeader) {
      return { isAuthenticated: false, customer: null, employee: null } as AuthState
    }

    const cookies = parseCookies(cookieHeader)
    const token = cookies[MEDUSA_JWT_COOKIE]

    if (!token) {
      return { isAuthenticated: false, customer: null, employee: null } as AuthState
    }

    try {
      const { customer } = await fetchWithBearer<{
        customer: SerializableCustomer
      }>("/store/customers/me", token)

      let employee: Employee | null = null
      try {
        const { customer: customerWithEmployee } =
          await fetchWithBearer<{ customer: CustomerWithEmployee }>(
            "/store/me",
            token
          )
        if (customerWithEmployee.employee) {
          employee = customerWithEmployee.employee
        }
      } catch {
        // Not a B2B customer or /store/me not available
      }

      return { isAuthenticated: true, customer, employee } as AuthState
    } catch {
      return { isAuthenticated: false, customer: null, employee: null } as AuthState
    }
  }
)
