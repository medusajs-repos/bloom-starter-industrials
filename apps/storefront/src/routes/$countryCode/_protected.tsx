import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthState } from "@/lib/data/auth"
import Layout from "@/components/layout"

export const Route = createFileRoute("/$countryCode/_protected")({
  beforeLoad: ({ context, params }): { authState: AuthState } => {
    const { authState } = context as unknown as { authState: AuthState }

    if (!authState.isAuthenticated) {
      throw redirect({
        to: "/$countryCode/account/login",
        params: { countryCode: params.countryCode },
      })
    }

    return { authState }
  },
  component: Layout,
})
