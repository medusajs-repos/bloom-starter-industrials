import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/utils/sdk"
import { getMe, Employee } from "@/lib/data/me"
import { AuthState, SerializableCustomer } from "@/lib/data/auth"

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
    // sdk.auth.login with type "session" sets an HttpOnly session cookie via the
    // /medusa-api proxy (same origin), so no manual cookie handling is needed.
    await sdk.auth.login("customer", "emailpass", { email, password })
    await fetchCustomer()
  }

  const logout = async () => {
    try {
      await sdk.auth.logout()
    } finally {
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
