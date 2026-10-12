/**
 * Workspace roles. Browser-safe: the sidebar, Settings and the server guards
 * all read the same rules.
 *
 * These are Better Auth's organization roles, untouched:
 * - owner: everything, and the only one who can delete the workspace or hand
 *   it to someone else. A workspace has exactly one.
 * - admin: invites people, changes their roles and removes them (never the
 *   owner), and manages the Anthropic key and the name.
 * - member: uploads documents and asks questions.
 *
 * Unrelated to the admin console's `user.role`, which is about the whole app.
 */

export type WorkspaceRole = "owner" | "admin" | "member"

/** What an invitation can make someone. Ownership is handed over, never sent. */
export const INVITABLE_ROLES = ["member", "admin"] as const
export type InvitableRole = (typeof INVITABLE_ROLES)[number]

/** How long an invitation link works. Mirrors `invitationExpiresIn` in `lib/auth.ts`. */
export const INVITATION_DAYS = 7

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

/** One line on what each role can do, for the invite form and the emails. */
export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: "Full control, including deleting the workspace.",
  admin: "Invites and manages members, the API key and the workspace name.",
  member: "Uploads documents and asks questions.",
}

/**
 * Better Auth stores several roles as a comma-separated string, so a role is
 * read as the strongest entry in it.
 */
export function workspaceRole(role: string | null | undefined): WorkspaceRole {
  const entries = (role ?? "").split(",").map((entry) => entry.trim())

  if (entries.includes("owner")) return "owner"
  if (entries.includes("admin")) return "admin"
  return "member"
}

export function roleLabel(role: string | null | undefined) {
  return ROLE_LABELS[workspaceRole(role)]
}

/** Owners and admins: members, invitations, the key and the name. */
export function canManageWorkspace(role: string | null | undefined) {
  return workspaceRole(role) !== "member"
}

export function isWorkspaceOwner(role: string | null | undefined) {
  return workspaceRole(role) === "owner"
}

/**
 * Members delete what they made; owners and admins can delete anything in the
 * workspace, since everyone shares the same library and chats.
 */
export function canDeleteItem(
  role: string | null | undefined,
  viewerId: string,
  ownerId: string
) {
  return canManageWorkspace(role) || viewerId === ownerId
}
