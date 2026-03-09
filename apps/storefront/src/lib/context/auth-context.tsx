import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/utils/sdk"
import { HttpTypes } from "@medusajs/types"
import { getMe, Employee } from "@/lib/data/me"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  customer: HttpTypes.StoreCustomer | null
  employee: Employee | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const AUTH_STATE_KEY = "auth_state"
const MEDUSA_TOKEN_KEY = "medusa_auth_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem(MEDUSA_TOKEN_KEY)
    const cachedState = sessionStorage.getItem(AUTH_STATE_KEY)
    return hasToken || cachedState === "authenticated"
  })
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)

  const fetchCustomer = useCallback(async () => {
    try {
      const { customer } = await sdk.store.customer.retrieve()

      let employeeData: Employee | null = null
      try {
        const { customer: customerWithEmployee } = await getMe()
        if (customerWithEmployee.employee) {
          employeeData = customerWithEmployee.employee
        }
      } catch {
        // Not a B2B customer or error fetching employee data
      }

      setCustomer(customer)
      setEmployee(employeeData)
      setIsAuthenticated(true)
      sessionStorage.setItem(AUTH_STATE_KEY, "authenticated")
    } catch {
      setCustomer(null)
      setEmployee(null)
      setIsAuthenticated(false)
      sessionStorage.setItem(AUTH_STATE_KEY, "unauthenticated")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const hasToken = !!localStorage.getItem(MEDUSA_TOKEN_KEY)
    if (!hasToken) {
      sessionStorage.setItem(AUTH_STATE_KEY, "unauthenticated")
      setIsLoading(false)
      return
    }
    fetchCustomer()
  }, [fetchCustomer])

  const login = async (email: string, password: string) => {
    await sdk.auth.login("customer", "emailpass", { email, password })
    await fetchCustomer()
  }

  const logout = async () => {
    try {
      await sdk.auth.logout()
    } finally {
      localStorage.removeItem(MEDUSA_TOKEN_KEY)
      sessionStorage.removeItem(AUTH_STATE_KEY)
      setCustomer(null)
      setEmployee(null)
      setIsAuthenticated(false)
      setIsLoading(false)
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
