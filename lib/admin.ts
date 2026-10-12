import {
  ADMIN_LOGS_ROUTE,
  ADMIN_ROUTE,
  ADMIN_SECURITY_ROUTE,
  ADMIN_USERS_ROUTE,
} from "@/lib/dashboard-nav"

/**
 * The admin console's shapes, routes and copy — no database, no auth config,
 * so client components can import it freely.
 *
 * Admin is not a workspace role. An organization has owners and members; this
 * is `user.role`, and it spans the whole app: the console counts every
 * document, every question and every account, not one workspace's.
 */

export {
  ADMIN_LOGS_ROUTE,
  ADMIN_ROUTE,
  ADMIN_SECURITY_ROUTE,
  ADMIN_USERS_ROUTE,
}

/** The role that opens the console. Better Auth's `adminRoles` matches it. */
export const ADMIN_ROLE = "admin"

/** The pill beside the header title while you're inside the console. */
export const ADMIN_BADGE = "Admin only"

/** True for the console and anything nested under it. */
export function isAdminRoute(pathname: string) {
  return pathname === ADMIN_ROUTE || pathname.startsWith(`${ADMIN_ROUTE}/`)
}

export function isAdminRole(role: string | null | undefined) {
  return role === ADMIN_ROLE
}

export type AdminTab = {
  href: string
  label: string
  /**
   * False until the tab's route exists. An unbuilt tab still renders — the
   * strip is the design — but as plain text rather than a link into a 404.
   * Flip it when the page lands.
   */
  ready: boolean
}

/** The console's sections — `ui-design/dashboard/light/admin-page.png`. */
export const ADMIN_TABS: AdminTab[] = [
  { href: ADMIN_ROUTE, label: "Overview", ready: true },
  { href: ADMIN_USERS_ROUTE, label: "Users", ready: true },
  { href: `${ADMIN_USERS_ROUTE}/new`, label: "Add user", ready: true },
  { href: ADMIN_SECURITY_ROUTE, label: "Security", ready: true },
  { href: ADMIN_LOGS_ROUTE, label: "Logs", ready: true },
]

/** How many names the "Most active users" card lists. */
export const ADMIN_TOP_USERS = 3

/** Days of history behind the "Active users · 30d" tile. */
export const ADMIN_ACTIVE_WINDOW_DAYS = 30

/** One row of the "Most active users" card. */
export type AdminActiveUser = {
  id: string
  name: string
  email: string
  image: string | null
  /** Questions asked this calendar month — the same window as the tile above. */
  questions: number
}

/** Everything the Overview tab renders. */
export type AdminOverview = {
  documentsIndexed: number
  questionsThisMonth: number
  /** Signed in or asked something inside the activity window. */
  activeUsers: number
  /** Workspaces with a working Anthropic key of their own. */
  workspacesWithKey: number
  totalWorkspaces: number
  totalUsers: number
  /** Busiest people this month, most questions first. */
  mostActive: AdminActiveUser[]
}

/** "1,842" — the console deals in whole counts, never abbreviations. */
export function formatCount(value: number) {
  return value.toLocaleString("en-US")
}

/* -------------------------------------------------------------------------
 * Users tab — `ui-design/dashboard/light/admin-users-page.png`
 * ---------------------------------------------------------------------- */

/** Rows per page — six, as the reference shows. */
export const ADMIN_USERS_PAGE_SIZE = 6

/** Longer than this and the field is being pasted into, not typed in. */
export const ADMIN_QUERY_MAX = 100

/**
 * Search and paging live in the query string, like the library's: the table
 * stays a server component reading real rows, and a filtered view can be
 * linked to and reloaded.
 *
 * Page is opt-in, so changing the search resets the reader to the first page.
 */
export function adminUsersHref({
  query = "",
  page = 1,
}: { query?: string; page?: number } = {}) {
  const params = new URLSearchParams()

  if (query) params.set("q", query)
  if (page > 1) params.set("page", String(page))

  const search = params.toString()

  return search ? `${ADMIN_USERS_ROUTE}?${search}` : ADMIN_USERS_ROUTE
}

/**
 * What the Status column says.
 *
 * `deactivated` is a decision someone made — the account is banned and can't
 * sign in. `inactive` is only an observation: nobody has signed in or asked
 * anything inside the window, which is what the note under the table explains.
 */
export type AdminUserStatus = "active" | "inactive" | "deactivated"

export type AdminUserRow = {
  id: string
  name: string
  email: string
  image: string | null
  /** True when a workspace they belong to has a working Anthropic key. */
  hasApiKey: boolean
  status: AdminUserStatus
  /** ISO timestamp of their last sign-in or question; null if neither. */
  lastActive: string | null
  /** Admins are marked so the console can't offer to deactivate itself. */
  isAdmin: boolean
}

export type AdminUsersView = {
  users: AdminUserRow[]
  total: number
  page: number
  pageCount: number
}

/**
 * "2h ago", "42d ago" — the Last active column.
 *
 * Days run all the way to three months rather than rolling into weeks like
 * `shortAge` does, because this column is read against the 30-day activity
 * window: "42d ago" answers the question "how far past it?" and "6w ago"
 * makes the reader do the arithmetic.
 */
export function lastActiveLabel(
  iso: string | null,
  now: Date = new Date()
): string {
  if (!iso) return "Never"

  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000)
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24

  if (seconds < 60) return "just now"
  if (minutes < 60) return `${Math.floor(minutes)}m ago`
  if (hours < 24) return `${Math.floor(hours)}h ago`
  if (days < 90) return `${Math.floor(days)}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`

  return `${Math.floor(days / 365)}y ago`
}
