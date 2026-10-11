import Link from "next/link"

// import { mainNav } from "@/lib/site-config"
import { AuthHeaderActions } from "@/components/auth/auth-header-actions"
import { TrosiveLogo } from "@/components/brand/trosive-logo"
// import { MobileNav } from "@/components/layout/mobile-nav"
// import { ModeToggle } from "@/components/theme/mode-toggle"

/**
 * Logo and auth buttons only. The section links, the mobile drawer and the
 * theme toggle (now in the footer) are commented out below, ready to restore.
 */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Trosive home">
          <TrosiveLogo />
        </Link>

        {/* <nav className="hidden items-center gap-6 md:flex">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
            >
              {Icon && (
                <Icon className="size-4 transition-transform group-hover:-translate-y-px" />
              )}
              {label}
            </Link>
          ))}
        </nav> */}

        <div className="flex items-center gap-2">
          {/* <ModeToggle /> */}
          <AuthHeaderActions />
          {/* <MobileNav className="md:hidden" /> */}
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
