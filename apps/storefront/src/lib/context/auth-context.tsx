import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { sdk } from "@/lib/utils/sdk"
import { Employee } from "@/lib/data/me"
import { AuthState, SerializableCustomer, getServerAuthState } from "@/lib/data/auth"

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

  // Uses the server function so the session cookie is forwarded server-to-server,
  // bypassing third-party cookie restrictions in the browser.
  const fetchCustomer = useCallback(async () => {
    setIsLoading(true)
    try {
      const state = await getServerAuthState()
      setCustomer(state.customer)
      setEmployee(state.employee)
      setIsAuthenticated(state.isAuthenticated)
    } catch {
      setCustomer(null)
      setEmployee(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // sdk.auth.login goes to /medusa-api/auth/* (same-origin proxy), so the
    // Set-Cookie response is treated as first-party and stored by the browser.
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
