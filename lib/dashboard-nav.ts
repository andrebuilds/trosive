import {
  ChartLineIcon,
  HouseIcon,
  LibraryIcon,
  MessageSquareIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  type LucideIcon,
} from "lucide-react"

/** Everything signed-in lives under `/app`, so links are built from this root. */
export const APP_ROOT = "/app"

/** The one route inside `/app` a user without a workspace can reach. */
export const ONBOARDING_ROUTE = `${APP_ROOT}/onboarding`

/** Onboarding's second step: the workspace exists, now its Anthropic key. */
export const ONBOARDING_API_KEY_ROUTE = `${ONBOARDING_ROUTE}/api-key`

/**
 * Settings is one screen with four tabs, but each tab is its own route — the
 * tab strip is navigation, so it survives a reload and can be linked to.
 */
export const SETTINGS_ROUTE = `${APP_ROOT}/settings`
export const MEMBERS_ROUTE = `${SETTINGS_ROUTE}/members`
export const API_KEY_ROUTE = `${SETTINGS_ROUTE}/api-key`
export const DANGER_ZONE_ROUTE = `${SETTINGS_ROUTE}/danger-zone`

/** Where an invitation email's button goes. Outside `/app`: it works signed out. */
export function invitationRoute(invitationId: string) {
  return `/invite/${invitationId}`
}

export const USAGE_ROUTE = `${APP_ROOT}/usage`

/**
 * The admin console's routes live here rather than in `lib/admin.ts` because
 * the nav below needs them and `lib/admin.ts` already reads `APP_ROOT` from
 * this file — the other direction would be a cycle. `lib/admin.ts` re-exports
 * them, so console code has one place to import from.
 */
export const ADMIN_ROUTE = `${APP_ROOT}/admin`
export const ADMIN_USERS_ROUTE = `${ADMIN_ROUTE}/users`
export const ADMIN_SECURITY_ROUTE = `${ADMIN_ROUTE}/security`
export const ADMIN_LOGS_ROUTE = `${ADMIN_ROUTE}/logs`

export type DashboardNavSubItem = {
  href: string
  label: string
}

/** Which live workspace number sits on the right of a nav item. */
export type DashboardNavCount = "chats" | "documents"

/**
 * The numbers themselves. Lives here rather than beside the query so the
 * sidebar can type its prop without importing a module that pulls in Prisma.
 */
export type DashboardNavCounts = Record<DashboardNavCount, number>

export type DashboardNavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Right-aligned count, read from the database by the workspace layout. */
  count?: DashboardNavCount
  /** Right-aligned pill, e.g. the owner role on Admin. */
  tag?: string
  /** Hidden from everyone but an admin — the console isn't advertised. */
  adminOnly?: boolean
  /** Nested links, revealed while the section is open. */
  items?: DashboardNavSubItem[]
}

export type DashboardNavGroup = {
  /** Rendered as a small uppercase label above the group; omit for the first. */
  title?: string
  items: DashboardNavItem[]
}

/** Sidebar navigation — `ui-design/dashboard/light/dashboard-sidebar.png`. */
export const dashboardNav: DashboardNavGroup[] = [
  {
    items: [
      { href: APP_ROOT, label: "Home", icon: HouseIcon },
      {
        href: `${APP_ROOT}/chats`,
        label: "Chats",
        icon: MessageSquareIcon,
        count: "chats",
      },
      {
        href: `${APP_ROOT}/library`,
        label: "Library",
        icon: LibraryIcon,
        count: "documents",
      },
      { href: `${APP_ROOT}/search`, label: "Search", icon: SearchIcon },
    ],
  },
  // Settings and Usage live in the account menu instead (`accountMenuNav`),
  // so this group is the admin console's alone and non-admins don't see it.
  {
    title: "Manage",
    items: [
      {
        href: ADMIN_ROUTE,
        label: "Admin",
        icon: ShieldIcon,
        tag: "Owner",
        adminOnly: true,
        // The sections appear underneath while you're inside the console.
        items: [
          { href: ADMIN_ROUTE, label: "Overview" },
          { href: ADMIN_USERS_ROUTE, label: "Users" },
          { href: ADMIN_SECURITY_ROUTE, label: "Security" },
          { href: ADMIN_LOGS_ROUTE, label: "Logs" },
        ],
      },
    ],
  },
]

/**
 * Links above "Sign out" in the account menu, in both sidebars. Settings'
 * own tabs (Account, Members, API key, Danger zone) are a click away from there.
 */
export const accountMenuNav = [
  { href: SETTINGS_ROUTE, label: "Settings", icon: SettingsIcon },
  { href: USAGE_ROUTE, label: "Usage", icon: ChartLineIcon },
]

/** Every route with a header title: the sidebar's and the account menu's. */
const navItems = [
  ...dashboardNav.flatMap((group) => group.items),
  ...accountMenuNav,
]

/**
 * The nav as this user should see it. Admin-only entries are dropped rather
 * than disabled — the console is staff furniture, and a greyed-out link tells
 * everyone it exists. The route guards itself either way.
 */
export function visibleDashboardNav(isAdmin: boolean) {
  if (isAdmin) return dashboardNav

  return dashboardNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly),
    }))
    .filter((group) => group.items.length > 0)
}

/** True for the item's own route and anything nested under it. */
export function isDashboardNavItemActive(
  item: Pick<DashboardNavItem, "href">,
  pathname: string
) {
  return item.href === APP_ROOT
    ? pathname === APP_ROOT
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
}

/**
 * The header title for a route — the label of the deepest nav item that owns
 * it, so `/app/library/contracts` still reads "Library".
 */
export function dashboardPageTitle(pathname: string) {
  const match = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isDashboardNavItemActive(item, pathname))

  return match?.label ?? "Home"
}

/** "Meridian Capital" → "MC", for the square badge beside the name. */
export function workspaceInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("")
}

// Under the user's name the sidebars show the workspace's API key status
// rather than a plan: there are no plans. See `apiKeyLabel` in `lib/byok.ts`.
