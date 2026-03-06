import { useState, useEffect, ReactNode } from "react"

const AUTH_STATE_KEY = "auth_state"

/**
 * Renders children only on the client, after hydration.
 * The fallback is only shown when the user was previously authenticated
 * (i.e. sessionStorage says "authenticated"), so they see a spinner while
 * we verify the session rather than a flash of the public layout.
 * For logged-out users and first-time visitors the fallback is null so
 * there is no spinner on load or after logout.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted) {
    return <>{children}</>
  }

  // Server render / before hydration: only show spinner if we know the user
  // was authenticated (sessionStorage is only available on the client so this
  // branch is only reached during SSR where we have no storage — always null).
  // On the client before useEffect fires (synchronous first paint), this also
  // runs, and here sessionStorage IS available.
  const wasAuthenticated =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(AUTH_STATE_KEY) === "authenticated"

  if (!wasAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-8 h-8 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
    </div>
  )
}
