import { createFileRoute, Outlet } from "@tanstack/react-router"
import { PublicLayout } from "@/components/public-layout"

export const Route = createFileRoute("/$countryCode/_public")({
  component: () => (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  ),
})
