import { useState, useEffect, useRef } from "react"
import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import { CompanyPendingScreen } from "./company-pending-screen"
import { OnboardingTour } from "./onboarding-tour"

export default function Layout() {
  const { employee } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarResolved = useRef(false)

  useEffect(() => {
    if (!sidebarResolved.current) {
      const savedState = localStorage.getItem("sidebar_collapsed")
      if (savedState !== null) {
        setIsCollapsed(savedState === "true")
      }
      sidebarResolved.current = true
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar_collapsed", String(newState))
  }

  const companyStatus = employee?.company?.status
  if (companyStatus && companyStatus !== "active") {
    return <CompanyPendingScreen companyName={employee?.company?.name} status={companyStatus} />
  }

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
