import { Link, useParams } from "@tanstack/react-router"
import { useState } from "react"

export function PublicHeader() {
  const params = useParams({ strict: false }) as { countryCode?: string }
  const countryCode = params.countryCode || "us"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={`/${countryCode}`} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900">ProLift</span>
              <span className="text-teal-600 text-xs font-semibold ml-0.5">PRO</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to={`/${countryCode}`}
              className="px-4 py-2 text-sm font-medium text-gray-900 rounded-full hover:bg-gray-100 transition-colors [&.active]:bg-gray-100"
            >
              Home
            </Link>
            <Link
              to={`/${countryCode}/store`}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-full hover:bg-gray-100 transition-colors [&.active]:bg-gray-100 [&.active]:text-gray-900"
            >
              Equipment
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              to={`/${countryCode}/account/login`}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>

            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              <Link
                to={`/${countryCode}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-900 rounded-lg hover:bg-gray-100"
              >
                Home
              </Link>
              <Link
                to={`/${countryCode}/store`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Equipment
              </Link>

              <div className="pt-2 mt-2 border-t border-gray-200 flex flex-col gap-2">
                <Link
                  to={`/${countryCode}/account/login`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg text-center"
                >
                  Sign In
                </Link>

              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
