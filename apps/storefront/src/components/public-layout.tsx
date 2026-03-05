import { PublicHeader } from "./public-header"
import { PublicFooter } from "./public-footer"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
