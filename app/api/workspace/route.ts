import { NextResponse } from "next/server"

import { deleteWorkspaceData } from "@/lib/account"
import { requireApiContext } from "@/lib/api-session"
import { db } from "@/lib/db"
import { isWorkspaceOwner } from "@/lib/workspace-roles"

/**
 * Deletes the active workspace — Settings → Danger zone, owner only.
 *
 * The body repeats the workspace's name, the same thing the dialog asks to be
 * typed, so a stray request from a stale tab can't take down a workspace other
 * than the one its owner is looking at.
 */
export async function DELETE(request: Request) {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  const { organizationId, role } = guard.context

  if (!isWorkspaceOwner(role)) {
    return NextResponse.json(
      { error: "Only the workspace's owner can delete it." },
      { status: 403 }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown
  } | null

  const workspace = await db.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  })

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 })
  }

  if (typeof body?.name !== "string" || body.name.trim() !== workspace.name) {
    return NextResponse.json(
      { error: "Type the workspace's name to confirm." },
      { status: 400 }
    )
  }

  await deleteWorkspaceData(organizationId)

  return NextResponse.json({ ok: true })
}
