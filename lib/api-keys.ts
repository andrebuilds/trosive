import { cache } from "react"
import Anthropic from "@anthropic-ai/sdk"

import { createAnthropicClient, instanceAnthropicKey } from "@/lib/anthropic"
import {
  ANTHROPIC_KEY_MAX_LENGTH,
  ANTHROPIC_KEY_PREFIX,
  API_KEY_ROUTE,
  keyHint,
  type ApiKeyStatus,
} from "@/lib/byok"
import { decryptSecret, encryptSecret } from "@/lib/crypto"
import { db } from "@/lib/db"
import { sendApiKeyInvalidEmail } from "@/lib/email"

/**
 * Bring your own key: the store. Server-only.
 *
 * One Anthropic key per workspace, sealed with `lib/crypto.ts`. The plaintext
 * exists in exactly two places: the PUT that saves it, and the request that
 * answers with it. It is never returned to a browser, never logged, and never
 * written anywhere but `ciphertext`.
 */

/** Workspace roles that may set, replace or remove the key. */
const MANAGER_ROLES = new Set(["owner", "admin"])

/** For the link in the "key stopped working" mail. */
const appOrigin = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.BETTER_AUTH_URL ??
  "http://localhost:3000"
).replace(/\/$/, "")

/** Better Auth stores several roles as a comma-separated string. */
function hasManagerRole(role: string | null | undefined) {
  return (role ?? "")
    .split(",")
    .some((entry) => MANAGER_ROLES.has(entry.trim()))
}

export async function canManageWorkspaceKey(
  organizationId: string,
  userId: string
) {
  const member = await db.member.findFirst({
    where: { organizationId, userId },
    select: { role: true },
  })

  return hasManagerRole(member?.role)
}

/**
 * What the UI may know about the key: everything except the key. Cached per
 * request, so a layout and its page share one lookup.
 */
export const getWorkspaceKeyStatus = cache(async function getWorkspaceKeyStatus(
  organizationId: string,
  userId: string
): Promise<ApiKeyStatus> {
  const [row, canManage] = await Promise.all([
    db.workspaceApiKey.findUnique({
      where: { organizationId },
      select: {
        hint: true,
        status: true,
        lastVerifiedAt: true,
        lastError: true,
      },
    }),
    canManageWorkspaceKey(organizationId, userId),
  ])

  if (row) {
    return {
      source: "workspace",
      hint: row.hint,
      state: row.status === "invalid" ? "invalid" : "valid",
      lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
      lastError: row.lastError,
      canManage,
    }
  }

  return {
    source: instanceAnthropicKey() ? "instance" : null,
    hint: null,
    state: null,
    lastVerifiedAt: null,
    lastError: null,
    canManage,
  }
})

export type SaveKeyResult = { ok: true } | { ok: false; error: string }

/**
 * Asks Anthropic whether the key works before anything is stored.
 *
 * `models.list` is authenticated but generates nothing, so checking a key
 * costs its owner nothing. A key that can list models but not use Opus would
 * still pass; that one surfaces on the first question with its own message.
 */
async function verifyKey(apiKey: string): Promise<SaveKeyResult> {
  try {
    await createAnthropicClient(apiKey).models.list({ limit: 1 })
    return { ok: true }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return {
        ok: false,
        error:
          "Anthropic didn't accept that key. Check you copied all of it, and that it hasn't been revoked.",
      }
    }

    if (error instanceof Anthropic.PermissionDeniedError) {
      return {
        ok: false,
        error:
          "That key works but isn't allowed to use the API. Check its workspace in the Anthropic Console.",
      }
    }

    if (error instanceof Anthropic.APIConnectionError) {
      return {
        ok: false,
        error: "Couldn't reach Anthropic to check the key. Try again.",
      }
    }

    console.error("[api-key] verification failed", error)

    return {
      ok: false,
      error: "Anthropic couldn't check that key right now. Try again.",
    }
  }
}

/** Checks the shape, verifies it with Anthropic, then seals and stores it. */
export async function saveWorkspaceKey(
  organizationId: string,
  userId: string,
  raw: string
): Promise<SaveKeyResult> {
  const apiKey = raw.trim()

  if (
    !apiKey.startsWith(ANTHROPIC_KEY_PREFIX) ||
    apiKey.length > ANTHROPIC_KEY_MAX_LENGTH ||
    /\s/.test(apiKey)
  ) {
    return {
      ok: false,
      error: `That doesn't look like an Anthropic API key. They start with "${ANTHROPIC_KEY_PREFIX}".`,
    }
  }

  const verified = await verifyKey(apiKey)

  if (!verified.ok) return verified

  const fields = {
    ciphertext: encryptSecret(apiKey),
    hint: keyHint(apiKey),
    status: "valid",
    lastVerifiedAt: new Date(),
    lastError: null,
    createdByUserId: userId,
  }

  await db.workspaceApiKey.upsert({
    where: { organizationId },
    create: { organizationId, ...fields },
    update: fields,
  })

  return { ok: true }
}

export async function deleteWorkspaceKey(organizationId: string) {
  await db.workspaceApiKey.deleteMany({ where: { organizationId } })
}

/**
 * The key a question in this workspace runs on: the workspace's own, else the
 * instance's `ANTHROPIC_API_KEY`, else nothing and the question is refused.
 *
 * A key already marked invalid is not tried again: it would fail the same way,
 * and the owners have been told. Saving a new one clears the mark.
 */
export async function resolveAnthropicKey(
  organizationId: string
): Promise<{ apiKey: string; source: "workspace" | "instance" } | null> {
  const row = await db.workspaceApiKey.findUnique({
    where: { organizationId },
    select: { ciphertext: true, status: true },
  })

  if (row) {
    if (row.status === "invalid") return null

    try {
      return { apiKey: decryptSecret(row.ciphertext), source: "workspace" }
    } catch (error) {
      // Sealed under another BETTER_AUTH_SECRET, most likely. Unusable either
      // way, so it's marked and the owners are asked for it again.
      console.error("[api-key] stored key could not be decrypted", error)
      await markWorkspaceKeyInvalid(
        organizationId,
        "The saved key can no longer be read on this server. Enter it again."
      )
      return null
    }
  }

  const instanceKey = instanceAnthropicKey()

  return instanceKey ? { apiKey: instanceKey, source: "instance" } : null
}

/**
 * Marks the key as not working and emails the workspace's owners, once per key
 * per day. A failed send is logged, never thrown: the mark is what matters.
 *
 * No `after()` here on purpose: this runs from inside the chat's response
 * stream, where the request scope `after()` needs may already be gone. The
 * route sends its error event first, so the reader isn't kept waiting.
 */
export async function markWorkspaceKeyInvalid(
  organizationId: string,
  reason: string
) {
  const updated = await db.workspaceApiKey.updateMany({
    where: { organizationId, status: { not: "invalid" } },
    data: { status: "invalid", lastError: reason },
  })

  // Already invalid: the owners were told when it happened.
  if (updated.count === 0) return

  try {
    const [key, organization, members] = await Promise.all([
      db.workspaceApiKey.findUnique({
        where: { organizationId },
        select: { id: true, hint: true },
      }),
      db.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      }),
      db.member.findMany({
        where: { organizationId },
        select: { role: true, user: { select: { email: true } } },
      }),
    ])

    if (!key || !organization) return

    const recipients = members
      .filter((member) => hasManagerRole(member.role))
      .map((member) => member.user.email)

    await Promise.all(
      recipients.map((email) =>
        sendApiKeyInvalidEmail(
          email,
          organization.name,
          key.hint,
          `${appOrigin}${API_KEY_ROUTE}`,
          key.id
        )
      )
    )
  } catch (error) {
    console.error("[email] api key invalid email failed", error)
  }
}

/** How many workspaces have a working key of their own, for the console. */
export function countWorkspacesWithKey() {
  return db.workspaceApiKey.count({ where: { status: "valid" } })
}
