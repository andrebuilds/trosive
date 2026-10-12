import type { Prisma } from "@/generated/prisma/client"

import { db } from "@/lib/db"
import { workspaceRole } from "@/lib/workspace-roles"

/**
 * What deleting an account or a workspace has to clean up itself. Server-only.
 *
 * Better Auth's cascades reach sessions, accounts, memberships and
 * invitations — every model it owns. Nothing else in the schema hangs off
 * `user`: avatars carry a plain `userId`, and chats and documents belong to an
 * organization, which outlives its members by design. So those are removed
 * here, from `beforeDelete`, while the account is still there to scope by.
 */

type Tx = Prisma.TransactionClient

/**
 * Every row a workspace owns, then the workspace.
 *
 * Chats before documents, and both before the organization: `chatDocument`
 * cascades from either side, and dropping the organization first would leave
 * its documents behind — they carry a plain `organizationId` column, not a
 * relation, so Postgres won't collect them. Members and invitations do
 * cascade from the organization.
 */
async function deleteWorkspaces(tx: Tx, organizationIds: string[]) {
  if (organizationIds.length === 0) return

  const scope = { organizationId: { in: organizationIds } }

  await tx.chat.deleteMany({ where: scope })
  await tx.document.deleteMany({ where: scope })
  // The usage ledger outlives chats and documents by design, but not the
  // workspace itself — there is nothing left to count once it's gone.
  await tx.questionEvent.deleteMany({ where: scope })
  // Its Anthropic key goes too: a ciphertext with no workspace to use it is
  // only a liability.
  await tx.workspaceApiKey.deleteMany({ where: scope })
  await tx.organization.deleteMany({ where: { id: { in: organizationIds } } })
}

/**
 * Settings → Danger zone → Delete workspace, owner only. Everyone else in it
 * loses access; their sessions fall back to another workspace of theirs, or
 * onboarding, on the next request.
 */
export async function deleteWorkspaceData(organizationId: string) {
  await db.$transaction((tx) => deleteWorkspaces(tx, [organizationId]))
}

/**
 * Splits the user's workspaces into the ones that exist only for them, which
 * go with the account, and the shared ones they own alone, which need a new
 * owner before the account goes or they'd be left with nobody in charge.
 *
 * The successor is the longest-standing admin, or failing that the
 * longest-standing member: whoever the workspace has trusted the most.
 */
async function planDeparture(tx: Tx, userId: string) {
  const memberships = await tx.member.findMany({
    where: { userId },
    select: { organizationId: true, role: true },
  })

  if (memberships.length === 0) return { sole: [], successors: [] }

  const others = await tx.member.findMany({
    where: {
      organizationId: { in: memberships.map((member) => member.organizationId) },
      userId: { not: userId },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, organizationId: true, role: true },
  })

  const sole: string[] = []
  const successors: string[] = []

  for (const membership of memberships) {
    const rest = others.filter(
      (member) => member.organizationId === membership.organizationId
    )

    if (rest.length === 0) {
      sole.push(membership.organizationId)
      continue
    }

    const leavingOwner = workspaceRole(membership.role) === "owner"
    const anotherOwner = rest.some(
      (member) => workspaceRole(member.role) === "owner"
    )

    if (!leavingOwner || anotherOwner) continue

    const successor =
      rest.find((member) => workspaceRole(member.role) === "admin") ?? rest[0]

    successors.push(successor.id)
  }

  return { sole, successors }
}

/**
 * Removes everything the account leaves behind, in one transaction so a
 * half-deleted account can't be signed back into: its avatar, the workspaces
 * nobody else is in, and ownership of the shared ones, handed on.
 */
export async function purgeUserData(userId: string) {
  await db.$transaction(async (tx) => {
    const { sole, successors } = await planDeparture(tx, userId)

    await tx.avatar.deleteMany({ where: { userId } })
    await deleteWorkspaces(tx, sole)

    if (successors.length > 0) {
      await tx.member.updateMany({
        where: { id: { in: successors } },
        data: { role: "owner" },
      })
    }
  })
}
