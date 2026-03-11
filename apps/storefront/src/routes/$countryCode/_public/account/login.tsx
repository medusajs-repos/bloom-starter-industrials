import { createFileRoute, redirect } from "@tanstack/react-router"
import LoginPage from "@/pages/login"
import { AuthState } from "@/lib/data/auth"

export const Route = createFileRoute("/$countryCode/_public/account/login")({
  beforeLoad: ({ context, params }) => {
    const { authState } = context as unknown as { authState: AuthState }
    if (authState.isAuthenticated) {
      throw redirect({ to: "/$countryCode/dashboard", params: { countryCode: params.countryCode } })
    }
  },
  head: () => ({
    meta: [
      { title: "Sign In | ProLift Equipment" },
      { name: "description", content: "Sign in to your ProLift Equipment account to view pricing, place orders, and manage your equipment." },
    ],
  }),
  component: LoginPage,
})
