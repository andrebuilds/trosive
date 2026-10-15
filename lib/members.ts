import { db } from "@/lib/db"
import { workspaceRole, type WorkspaceRole } from "@/lib/workspace-roles"

/**
 * The people in a workspace and the invitations still out, for Settings →
 * Members. Server-only.
 *
 * Read from the tables rather than `getFullOrganization`, which caps members
 * at a page and leaves the invitations to a second call anyway. Changing any of
 * it goes through Better Auth's client, except handing over ownership, which
 * is `transferOwnership` below.
 */

export type MemberView = {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: WorkspaceRole
  /** ISO timestamp of when they joined. */
  joinedAt: string
}

export type PendingInvitationView = {
  id: string
  email: string
  role: WorkspaceRole
  /** ISO timestamp. */
  expiresAt: string
  inviterName: string
}

const ROLE_ORDER: Record<WorkspaceRole, number> = {
  owner: 0,
  admin: 1,
  member: 2,
}

/** Owner first, then admins, then members, each oldest first. */
export async function listMembers(
  organizationId: string
): Promise<MemberView[]> {
  const members = await db.member.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  return members
    .map((member) => ({
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      role: workspaceRole(member.role),
      joinedAt: member.createdAt.toISOString(),
    }))
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
}

/** Pending and not yet expired, newest first. */
export async function listPendingInvitations(
  organizationId: string
): Promise<PendingInvitationView[]> {
  const invitations = await db.invitation.findMany({
    where: {
      organizationId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      user: { select: { name: true, email: true } },
    },
  })

  return invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: workspaceRole(invitation.role),
    expiresAt: invitation.expiresAt.toISOString(),
    inviterName: invitation.user.name || invitation.user.email,
  }))
}

/**
 * Makes another member the owner and the current owner an admin, in one
 * transaction so the workspace is never without an owner or with two.
 *
 * Our own route rather than `updateMemberRole`: the `beforeUpdateMemberRole`
 * hook refuses "owner" everywhere else, so an admin can't promote themselves.
 *
 * Returns false when the caller isn't the owner or the target isn't in this
 * workspace.
 */
export async function transferOwnership({
  organizationId,
  ownerUserId,
  memberId,
}: {
  organizationId: string
  ownerUserId: string
  memberId: string
}) {
  return db.$transaction(async (tx) => {
    const [owner, target] = await Promise.all([
      tx.member.findFirst({
        where: { organizationId, userId: ownerUserId },
        select: { id: true, role: true },
      }),
      tx.member.findFirst({
        where: { id: memberId, organizationId },
        select: { id: true },
      }),
    ])

    if (!owner || workspaceRole(owner.role) !== "owner") return false
    if (!target || target.id === owner.id) return false

    await tx.member.update({
      where: { id: target.id },
      data: { role: "owner" },
    })
    await tx.member.update({ where: { id: owner.id }, data: { role: "admin" } })

    return true
  })
}
