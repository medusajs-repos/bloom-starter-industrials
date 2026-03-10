import { createFileRoute, redirect } from "@tanstack/react-router"
import AcceptInvitePage from "@/pages/accept-invite"
import { AuthState } from "@/lib/data/auth"

export const Route = createFileRoute("/$countryCode/_public/account/accept-invite")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: typeof search.token === "string" ? search.token : undefined,
    }
  },
  beforeLoad: ({ context, params }) => {
    const { authState } = context as unknown as { authState: AuthState }
    if (authState.isAuthenticated) {
      throw redirect({ to: "/$countryCode/", params: { countryCode: params.countryCode } })
    }
  },
  head: () => ({
    meta: [
      { title: "Accept Invite | ProLift Equipment" },
      { name: "description", content: "Accept your team invitation and create your account." },
    ],
  }),
  component: AcceptInvitePage,
})
