import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { isAdminRole } from "@/lib/admin"
import { auth, bootstrapAdminIds } from "@/lib/auth"
import { APP_ROOT, ONBOARDING_ROUTE } from "@/lib/dashboard-nav"
import { db } from "@/lib/db"
import { workspaceRole, type WorkspaceRole } from "@/lib/workspace-roles"

/** A workspace as the signed-in user sees it: theirs to work in, in a role. */
export type Workspace = {
  id: string
  name: string
  slug: string
  role: WorkspaceRole
}

/**
 * The session for the current request. `cache` dedupes it, so a layout and the
 * page it wraps share one lookup instead of hitting the database twice.
 *
 * Server-only — client components use `useSession` from `lib/auth-client`.
 */
export const getServerSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

/** Signed-in guard for `/app`. The proxy bounces most of these first. */
export async function requireSession() {
  const session = await getServerSession()

  if (!session) {
    redirect("/")
  }

  return session
}

/**
 * Whether a signed-in user may operate the admin console.
 *
 * Two ways in, and both are server-side facts: the role on their row, or the
 * bootstrap list in the environment. Nothing a browser sends is consulted.
 */
export function isAdminUser(user: { id: string; role?: string | null }) {
  return isAdminRole(user.role) || bootstrapAdminIds.includes(user.id)
}

/** True when the current request is being made by an admin. */
export const isCurrentUserAdmin = cache(async () => {
  const session = await getServerSession()

  return session ? isAdminUser(session.user) : false
})

/**
 * The guard for `/app/admin`.
 *
 * Sends a non-admin to the app root rather than a 403 page: the console isn't
 * something they were refused, it's something that isn't theirs to know about.
 */
export async function requireAdmin() {
  const session = await requireSession()

  if (!isAdminUser(session.user)) {
    redirect(APP_ROOT)
  }

  return session
}

/**
 * Every workspace the signed-in user belongs to, with their role in each,
 * oldest membership first. Deduped per request.
 *
 * Read from `member` rather than `listOrganizations`, which leaves the role
 * out, and the role decides half of what the sidebar and Settings show.
 */
export const getWorkspaces = cache(async (): Promise<Workspace[]> => {
  const session = await getServerSession()

  if (!session) return []

  const memberships = await db.member.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      organization: { select: { id: true, name: true, slug: true } },
    },
  })

  return memberships.map(({ role, organization }) => ({
    ...organization,
    role: workspaceRole(role),
  }))
})

/**
 * The one being worked in: the session's active workspace, or the oldest one
 * when that's unset or the user was removed from it.
 */
export function activeWorkspace(
  workspaces: Workspace[],
  activeId: string | null | undefined
) {
  return (
    workspaces.find((workspace) => workspace.id === activeId) ?? workspaces[0]
  )
}

/**
 * The workspace the user is working in, with their role in it. A signed-in
 * user without one has not finished onboarding, so there is nothing to show
 * them but the form.
 */
export async function requireOrganization() {
  const session = await requireSession()
  const workspace = activeWorkspace(
    await getWorkspaces(),
    session.session.activeOrganizationId
  )

  if (!workspace) {
    redirect(ONBOARDING_ROUTE)
  }

  return workspace
}

/** The reverse guard: onboarding is pointless once a workspace exists. */
export async function redirectIfOnboarded() {
  await requireSession()
  const workspaces = await getWorkspaces()

  if (workspaces.length > 0) {
    redirect(APP_ROOT)
  }
}

/** Landing pages call this to hand signed-in visitors straight to the app. */
export async function redirectIfSignedIn() {
  const session = await getServerSession()

  if (session) {
    redirect(APP_ROOT)
  }
}
