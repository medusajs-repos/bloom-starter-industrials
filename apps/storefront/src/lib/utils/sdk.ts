import Medusa from "@medusajs/js-sdk"

// In the browser, all Medusa API calls go through the /medusa-api proxy so that
// session cookies are set on the same origin (no cross-origin cookie issues).
// On the server (SSR / createServerFn) we call the backend directly using the
// real backend URL, forwarding the incoming session cookie explicitly.
const isServer = typeof window === "undefined"

let MEDUSA_BACKEND_URL = "http://localhost:9000"
if (import.meta.env.VITE_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL
}

// Client-side SDK: routes through the same-origin proxy so session cookies work.
// Server-side SDK: calls the backend directly (used only in createServerFn).
export const sdk = new Medusa({
  baseUrl: isServer ? MEDUSA_BACKEND_URL : "/medusa-api",
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  auth: {
    type: "session",
  },
})
