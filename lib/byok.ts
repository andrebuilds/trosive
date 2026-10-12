import { API_KEY_ROUTE } from "@/lib/dashboard-nav"

/**
 * Bring your own key: the shapes and copy, with no database and no SDK, so
 * client components can import it freely. The store is `lib/api-keys.ts`.
 *
 * Trosive has no plans and no limits. Every answer runs on an Anthropic API
 * key that belongs to the workspace, so the cost lands on the workspace's own
 * Anthropic bill, at Anthropic's prices, with nothing added on top.
 */

export { API_KEY_ROUTE }

/** Where keys are made. Linked from onboarding and Settings. */
export const ANTHROPIC_KEYS_URL = "https://console.anthropic.com/settings/keys"

/** Where a spend limit is set, which the copy recommends doing first. */
export const ANTHROPIC_LIMITS_URL =
  "https://console.anthropic.com/settings/limits"

/** Every Anthropic API key starts with this. */
export const ANTHROPIC_KEY_PREFIX = "sk-ant-"

/** Keys are ~108 characters; this only stops a pasted paragraph. */
export const ANTHROPIC_KEY_MAX_LENGTH = 300

/** The messages route's code when there's nothing to answer with. */
export const NO_API_KEY_CODE = "NO_API_KEY"

/**
 * What the workspace answers with, as the UI sees it. Never the key itself.
 *
 * `source` is `workspace` for a key saved in Settings, `instance` when a
 * self-hosted server's `ANTHROPIC_API_KEY` covers workspaces without one, and
 * `null` when there is nothing and questions are off.
 */
export type ApiKeyStatus = {
  source: "workspace" | "instance" | null
  /** `sk-ant-…AbCd`. Null unless `source` is `workspace`. */
  hint: string | null
  /** `invalid` once Anthropic rejected the saved key. */
  state: "valid" | "invalid" | null
  /** ISO timestamp. */
  lastVerifiedAt: string | null
  lastError: string | null
  /** Owners and admins of the workspace may change it; members only see it. */
  canManage: boolean
}

/** True when a question has something to run on. */
export function canAsk(status: ApiKeyStatus) {
  if (status.source === "instance") return true
  return status.source === "workspace" && status.state !== "invalid"
}

/** The line under the user's name in both sidebars. */
export function apiKeyLabel(status: ApiKeyStatus) {
  if (status.source === "instance") return "Instance API key"
  if (status.source === null) return "No API key"
  if (status.state === "invalid") return "API key not working"
  return "Your API key"
}

/** `sk-ant-api03-…AbCd`: enough to recognise it in the Anthropic Console. */
export function keyHint(key: string) {
  const prefix = key.match(/^sk-ant-[a-z]+\d*-/)?.[0] ?? ANTHROPIC_KEY_PREFIX

  return `${prefix}…${key.slice(-4)}`
}

/** Shown wherever a question can't be asked yet. */
export function noKeyMessage(status: ApiKeyStatus) {
  if (status.state === "invalid") {
    return status.canManage
      ? "Your Anthropic API key stopped working. Replace it to keep asking questions."
      : "This workspace's Anthropic API key stopped working. Ask an owner to replace it."
  }

  return status.canManage
    ? "Add your Anthropic API key to start asking questions."
    : "This workspace has no Anthropic API key yet. Ask an owner to add one."
}
