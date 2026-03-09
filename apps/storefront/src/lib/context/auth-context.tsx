import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/utils/sdk"
import { getMe, Employee } from "@/lib/data/me"
import { AuthState, SerializableCustomer, MEDUSA_JWT_COOKIE } from "@/lib/data/auth"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  customer: SerializableCustomer | null
  employee: Employee | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
  initialState: AuthState
}

// Write the JWT to a first-party cookie so the TanStack Start server fn
// can read it on subsequent SSR requests for server-side auth resolution.
function setJwtCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7 // 7 days
  document.cookie = `${MEDUSA_JWT_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearJwtCookie() {
  document.cookie = `${MEDUSA_JWT_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export function AuthProvider({ children, initialState }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialState.isAuthenticated
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [customer, setCustomer] = useState<SerializableCustomer | null>(
    initialState.customer
  )
  const [employee, setEmployee] = useState<Employee | null>(
    initialState.employee
  )

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true)
    try {
      const { customer } = await sdk.store.customer.retrieve()

      let employeeData: Employee | null = null
      try {
        const { customer: customerWithEmployee } = await getMe()
        if (customerWithEmployee.employee) {
          employeeData = customerWithEmployee.employee
        }
      } catch {
        // Not a B2B customer
      }

      setCustomer(customer as unknown as SerializableCustomer)
      setEmployee(employeeData)
      setIsAuthenticated(true)
    } catch {
      setCustomer(null)
      setEmployee(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const token = await sdk.auth.login("customer", "emailpass", { email, password })
    // Persist JWT in a first-party cookie for server-side auth resolution
    if (token && typeof token === "string") {
      setJwtCookie(token)
    }
    await fetchCustomer()
  }

  const logout = async () => {
    try {
      await sdk.auth.logout()
    } finally {
      clearJwtCookie()
      setCustomer(null)
      setEmployee(null)
      setIsAuthenticated(false)
    }
  }

  const refetch = async () => {
    await fetchCustomer()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        customer,
        employee,
        isAdmin: employee?.is_admin ?? false,
        login,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
