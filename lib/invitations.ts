import { db } from "@/lib/db"
import { roleLabel, workspaceRole, type WorkspaceRole } from "@/lib/workspace-roles"

/**
 * Workspace invitations, read straight from the table. Server-only.
 *
 * Better Auth owns creating, accepting and cancelling them; these are the
 * reads its API doesn't offer without a session: the sign-up gate, the
 * `/invite/<id>` page someone opens signed out, and onboarding's notice.
 */

/** Pending and not expired. Better Auth stores invitation emails lowercased. */
function openInvitationWhere(email: string) {
  return {
    email: email.toLowerCase(),
    status: "pending",
    expiresAt: { gt: new Date() },
  }
}

/** Lets an invited address sign up while public sign-ups are closed. */
export async function hasOpenInvitation(email: string) {
  const invitation = await db.invitation.findFirst({
    where: openInvitationWhere(email),
    select: { id: true },
  })

  return invitation !== null
}

export type InvitationSummary = {
  id: string
  email: string
  workspaceName: string
  inviterName: string
  role: WorkspaceRole
  roleLabel: string
}

const summarySelect = {
  id: true,
  email: true,
  role: true,
  organization: { select: { name: true } },
  user: { select: { name: true, email: true } },
} as const

function toSummary(invitation: {
  id: string
  email: string
  role: string | null
  organization: { name: string }
  user: { name: string; email: string }
}): InvitationSummary {
  return {
    id: invitation.id,
    email: invitation.email,
    workspaceName: invitation.organization.name,
    inviterName: invitation.user.name || invitation.user.email,
    role: workspaceRole(invitation.role),
    roleLabel: roleLabel(invitation.role),
  }
}

/** Invitations waiting for this address, newest first, for onboarding. */
export async function openInvitationsFor(email: string) {
  const invitations = await db.invitation.findMany({
    where: openInvitationWhere(email),
    orderBy: { createdAt: "desc" },
    select: summarySelect,
  })

  return invitations.map(toSummary)
}

/**
 * The invitation behind `/invite/<id>`, or why it can't be used. Only the
 * workspace's name, who sent it and the role are ever shown: the id is the
 * secret, and it travels in an email to the invited address.
 */
export async function findInvitation(
  id: string
): Promise<
  | { state: "open"; invitation: InvitationSummary }
  | { state: "expired" | "used" | "missing" }
> {
  const invitation = await db.invitation.findUnique({
    where: { id },
    select: { ...summarySelect, status: true, expiresAt: true },
  })

  if (!invitation) return { state: "missing" }
  if (invitation.status !== "pending") return { state: "used" }
  if (invitation.expiresAt <= new Date()) return { state: "expired" }

  return { state: "open", invitation: toSummary(invitation) }
}
