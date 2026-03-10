import { createFileRoute, redirect } from "@tanstack/react-router"
import LoginPage from "@/pages/login"
import { getServerAuthState } from "@/lib/data/auth"

export const Route = createFileRoute("/$countryCode/account/login")({
  beforeLoad: async ({ params }) => {
    const { isAuthenticated } = await getServerAuthState()
    if (isAuthenticated) {
      throw redirect({ to: "/$countryCode", params: { countryCode: params.countryCode } })
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
