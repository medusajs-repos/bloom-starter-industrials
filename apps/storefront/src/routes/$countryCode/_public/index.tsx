import { createFileRoute, redirect } from "@tanstack/react-router"
import LandingPage from "@/pages/landing"
import { AuthState } from "@/lib/data/auth"

export const Route = createFileRoute("/$countryCode/_public/")({
  beforeLoad: ({ context, params }) => {
    const { authState } = context as unknown as { authState: AuthState }
    if (authState.isAuthenticated) {
      throw redirect({
        to: "/$countryCode/",
        params: { countryCode: params.countryCode },
      })
    }
  },
  head: () => ({
    meta: [
      { title: "ProLift Equipment | Industrial Lifting Solutions" },
      {
        name: "description",
        content:
          "ProLift gives your team a single place to browse, quote, and order industrial lifting equipment. Volume pricing, real inventory, and a streamlined approval workflow.",
      },
    ],
  }),
  component: LandingPage,
})
