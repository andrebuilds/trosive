"use client"

import { usePathname } from "next/navigation"

import { ADMIN_BADGE, isAdminRoute } from "@/lib/admin"
import { dashboardPageTitle } from "@/lib/dashboard-nav"
import { SEARCH_ROUTE } from "@/lib/search"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { GitHubStarsButton } from "@/components/layout/github-stars-button"
import { SearchCommand } from "@/components/search/search-command"
import { ModeToggle } from "@/components/theme/mode-toggle"

/**
 * Chrome above the page — `ui-design/dashboard/light/dashboard-header.png`.
 *
 * No account menu: the sidebar's footer already has one, so the right end
 * links to the repo instead.
 */
function DashboardHeader({
  stars,
  title,
  badge,
  showSearch = true,
  showSidebarTrigger = false,
}: {
  /** The repo's star count, fetched by the layout; null shows the icon alone. */
  stars: number | null
  /** Overrides the route's own title. */
  title?: string
  /**
   * Overrides the pill beside the title. Left alone, the console adds its own
   * "ADMIN ONLY" — the layout that renders this header is shared by every
   * workspace route and doesn't know which one it's wrapping, the same reason
   * the title is read off the pathname.
   */
  badge?: string
  showSearch?: boolean
  /**
   * Opt-in, because `SidebarTrigger` throws outside a `SidebarProvider` and
   * only `(workspace)` has one. Forgetting it costs the sidebar toggle;
   * assuming it costs the whole page.
   */
  showSidebarTrigger?: boolean
}) {
  const pathname = usePathname()
  const pill = badge ?? (isAdminRoute(pathname) ? ADMIN_BADGE : undefined)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-6">
      {showSidebarTrigger && (
        <>
          <SidebarTrigger className="-ml-2 cursor-pointer" />
          <Separator
            orientation="vertical"
            className="mr-1 data-vertical:h-5 data-vertical:self-auto"
          />
        </>
      )}

      <h1 className="truncate text-base font-semibold">
        {title ?? dashboardPageTitle(pathname)}
      </h1>

      {pill && (
        <Badge className="shrink-0 bg-brand/15 font-mono text-[0.625rem] font-bold tracking-wider text-brand uppercase">
          {pill}
        </Badge>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* The search page has a search box of its own, and the reference
            drops this one there rather than showing two.

            The trigger is a rigid `w-64` by design; on a tablet that plus a
            title and a badge is wider than the header, so it gives ground
            until there's room for its full width again. */}
        {showSearch && pathname !== SEARCH_ROUTE && (
          <SearchCommand className="hidden w-44 sm:inline-flex lg:w-64" />
        )}
        <ModeToggle className="size-9" />

        <Separator
          orientation="vertical"
          className="mx-1 data-vertical:h-5 data-vertical:self-auto"
        />

        <GitHubStarsButton stars={stars} className="h-9" />
      </div>
    </header>
  )
}

export { DashboardHeader }
