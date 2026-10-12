import { NextResponse } from "next/server"

import {
  canManageWorkspaceKey,
  deleteWorkspaceKey,
  getWorkspaceKeyStatus,
  saveWorkspaceKey,
} from "@/lib/api-keys"
import { requireApiContext } from "@/lib/api-session"

/**
 * The workspace's Anthropic key: bring your own key.
 *
 * Every response carries the status the UI renders, never the key. The PUT is
 * the only place a plaintext key arrives, and it goes from the body to
 * Anthropic's verification and into `encryptSecret` without being logged.
 *
 * Anyone in the workspace may read the status; only its owners and admins may
 * change it.
 */

export async function GET() {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  const { organizationId, userId } = guard.context

  return NextResponse.json({
    status: await getWorkspaceKeyStatus(organizationId, userId),
  })
}

async function requireManager(organizationId: string, userId: string) {
  if (await canManageWorkspaceKey(organizationId, userId)) return null

  return NextResponse.json(
    { error: "Only the workspace's owners and admins can change its API key." },
    { status: 403 }
  )
}

export async function PUT(request: Request) {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  const { organizationId, userId } = guard.context
  const refused = await requireManager(organizationId, userId)
  if (refused) return refused

  const body = (await request.json().catch(() => null)) as {
    apiKey?: unknown
  } | null

  if (typeof body?.apiKey !== "string" || !body.apiKey.trim()) {
    return NextResponse.json(
      { error: "Paste your Anthropic API key." },
      { status: 400 }
    )
  }

  const saved = await saveWorkspaceKey(organizationId, userId, body.apiKey)

  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 422 })
  }

  return NextResponse.json({
    status: await getWorkspaceKeyStatus(organizationId, userId),
  })
}

export async function DELETE() {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  const { organizationId, userId } = guard.context
  const refused = await requireManager(organizationId, userId)
  if (refused) return refused

  await deleteWorkspaceKey(organizationId)

  return NextResponse.json({
    status: await getWorkspaceKeyStatus(organizationId, userId),
  })
}
