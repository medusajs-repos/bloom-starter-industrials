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

// Serializable customer shape returned from the server fn
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

async function fetchWithSession<T>(
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
    credentials: "include",
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

    try {
      const { customer } = await fetchWithSession<{
        customer: SerializableCustomer
      }>("/store/customers/me", cookieHeader)

      let employee: Employee | null = null
      try {
        const { customer: customerWithEmployee } =
          await fetchWithSession<{ customer: CustomerWithEmployee }>(
            "/store/me",
            cookieHeader
          )
        if (customerWithEmployee.employee) {
          employee = customerWithEmployee.employee
        }
      } catch {
        // Not a B2B customer
      }

      return { isAuthenticated: true, customer, employee } as AuthState
    } catch {
      return { isAuthenticated: false, customer: null, employee: null } as AuthState
    }
  }
)
