import { useState, useEffect } from "react"
import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./sidebar"
import { PublicLayout } from "./public-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { CompanyPendingScreen } from "./company-pending-screen"
import { OnboardingTour } from "./onboarding-tour"

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isAuthenticated, isLoading, employee } = useAuth()
  
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_collapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar_collapsed", String(newState))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <Outlet />
      </PublicLayout>
    )
  }

  // Company not yet activated -- show pending review screen
  const companyStatus = employee?.company?.status
  if (companyStatus && companyStatus !== "active") {
    return <CompanyPendingScreen companyName={employee?.company?.name} status={companyStatus} />
  }

  // Show authenticated dashboard layout
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar countryCode="us" collapsed={isCollapsed} onToggle={toggleCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[72px]" : "ml-[280px]"
        }`}
      >
        <Outlet />
      </main>
      <OnboardingTour />
    </div>
  )
}
