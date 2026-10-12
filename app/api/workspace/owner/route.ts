import { NextResponse } from "next/server"

import { requireApiContext } from "@/lib/api-session"
import { transferOwnership } from "@/lib/members"
import { isWorkspaceOwner } from "@/lib/workspace-roles"

/**
 * Hands the workspace to another member — Settings → Members → "Make owner".
 *
 * The owner becomes an admin, so they keep running the workspace alongside the
 * new owner until either of them changes that.
 */
export async function POST(request: Request) {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  const { organizationId, userId, role } = guard.context

  if (!isWorkspaceOwner(role)) {
    return NextResponse.json(
      { error: "Only the workspace's owner can hand it over." },
      { status: 403 }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    memberId?: unknown
  } | null

  if (typeof body?.memberId !== "string" || !body.memberId) {
    return NextResponse.json(
      { error: "Choose who should own the workspace." },
      { status: 400 }
    )
  }

  const transferred = await transferOwnership({
    organizationId,
    ownerUserId: userId,
    memberId: body.memberId,
  })

  if (!transferred) {
    return NextResponse.json(
      { error: "That person isn't a member of this workspace." },
      { status: 404 }
    )
  }

  return NextResponse.json({ ok: true })
}
