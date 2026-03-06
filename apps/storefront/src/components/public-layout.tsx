import { PublicHeader } from "./public-header"
import { PublicFooter } from "./public-footer"
import { PreviewBanner } from "./preview-banner"

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const showBanner = Boolean(import.meta.env.VITE_SHOW_BANNER_FOR_PREVIEW)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showBanner && <PreviewBanner />}
      <PublicHeader bannerVisible={showBanner} />
      <main className={`flex-1 ${showBanner ? "pt-[112px]" : "pt-16"}`}>
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
