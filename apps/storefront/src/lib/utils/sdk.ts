import Medusa from "@medusajs/js-sdk"

// In the browser, all SDK calls go to /medusa-api/* on the same origin.
// The TanStack Start server proxies these requests to the Medusa backend,
// forwarding the session cookie server-to-server. This avoids third-party
// cookie blocking — the browser always talks to its own origin.
//
// During SSR (server-side), import.meta.env is not available for window-level
// resolution but the sdk module is still imported — the sdk is only used
// client-side after hydration. Auth state during SSR uses getServerAuthState()
// which calls the Medusa backend directly with process.env values.
const SDK_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/medusa-api`
    : "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: SDK_BASE_URL,
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  auth: {
    type: "session",
  },
})
