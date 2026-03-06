import { useState, useEffect, ReactNode } from "react"

/**
 * Renders children only on the client, after hydration.
 * On the server (and during initial hydration), renders the fallback instead.
 * This prevents hydration mismatches for components that read browser-only
 * APIs like sessionStorage to determine their initial render.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? <>{children}</> : <>{fallback}</>
}
