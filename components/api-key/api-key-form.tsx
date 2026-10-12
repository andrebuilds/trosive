"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { KeyRoundIcon } from "lucide-react"

import {
  ANTHROPIC_KEY_PREFIX,
  ANTHROPIC_KEYS_URL,
  type ApiKeyStatus,
} from "@/lib/byok"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { SpinnerRing } from "@/components/common/spinner-ring"

const API_KEY_ENDPOINT = "/api/workspace/api-key"

/** "12 Oct 2026", for the "Verified" line. */
function verifiedOn(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Bring your own key: the one control for the workspace's Anthropic key, used
 * by onboarding's second step and by Settings, API key.
 *
 * The key goes up once, in the PUT, and never comes back down: what renders
 * afterwards is the server's `ApiKeyStatus`, a hint like `sk-ant-api03-…AbCd`.
 * Saving asks Anthropic whether the key works before storing anything, so a
 * typo is caught here rather than on the first question.
 */
function ApiKeyForm({
  status: initialStatus,
  onSaved,
  submitLabel = "Save key",
  autoFocus = false,
}: {
  status: ApiKeyStatus
  /** Runs after a key is saved and verified; onboarding moves on with it. */
  onSaved?: (status: ApiKeyStatus) => void
  submitLabel?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = React.useState(initialStatus)
  const [apiKey, setApiKey] = React.useState("")
  const [replacing, setReplacing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [removing, setRemoving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const hasOwnKey = status.source === "workspace"
  const showInput = status.canManage && (!hasOwnKey || replacing)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = apiKey.trim()
    if (!value) return

    setSaving(true)
    setError(null)

    const response = await fetch(API_KEY_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: value }),
    }).catch(() => null)

    const body = (await response?.json().catch(() => null)) as {
      status?: ApiKeyStatus
      error?: string
    } | null

    setSaving(false)

    if (!response?.ok || !body?.status) {
      setError(body?.error ?? "Couldn't save the key. Try again.")
      return
    }

    // Out of state as soon as it's stored: nothing on the page holds it.
    setApiKey("")
    setReplacing(false)
    setStatus(body.status)
    router.refresh()

    if (onSaved) {
      onSaved(body.status)
      return
    }

    toast.add({
      type: "success",
      title: "API key saved",
      description: "Anthropic accepted it. Questions run on it from now on.",
    })
  }

  async function handleRemove() {
    setRemoving(true)
    setError(null)

    const response = await fetch(API_KEY_ENDPOINT, { method: "DELETE" }).catch(
      () => null
    )
    const body = (await response?.json().catch(() => null)) as {
      status?: ApiKeyStatus
      error?: string
    } | null

    setRemoving(false)

    if (!response?.ok || !body?.status) {
      toast.add({
        type: "error",
        title: "Couldn't remove the key",
        description: body?.error ?? "Please try again.",
      })
      return
    }

    setStatus(body.status)
    router.refresh()
    toast.add({
      type: "success",
      title: "API key removed",
      description:
        "It's deleted from Trosive. Revoke it in the Anthropic Console too if you no longer need it.",
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {hasOwnKey && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
          <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
          <code className="font-mono text-sm">{status.hint}</code>
          {status.state === "invalid" ? (
            <Badge variant="destructive">Not working</Badge>
          ) : (
            <Badge variant="secondary">Working</Badge>
          )}
          {status.lastVerifiedAt && status.state !== "invalid" && (
            <span className="text-sm text-muted-foreground">
              Verified {verifiedOn(status.lastVerifiedAt)}
            </span>
          )}

          {status.canManage && !replacing && (
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={removing}
                onClick={() => setReplacing(true)}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer text-destructive"
                disabled={removing}
                onClick={handleRemove}
              >
                {removing && <SpinnerRing />}
                Remove
              </Button>
            </div>
          )}

          {status.state === "invalid" && status.lastError && (
            <p className="w-full text-sm text-destructive">
              {status.lastError}
            </p>
          )}
        </div>
      )}

      {showInput && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Field>
            <FieldLabel htmlFor="anthropic-api-key">
              {hasOwnKey ? "New Anthropic API key" : "Anthropic API key"}
            </FieldLabel>
            <Input
              id="anthropic-api-key"
              name="apiKey"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={`${ANTHROPIC_KEY_PREFIX}api03-…`}
              autoComplete="off"
              spellCheck={false}
              autoFocus={autoFocus}
              disabled={saving}
              className="h-11 font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Create one in the{" "}
              <a
                href={ANTHROPIC_KEYS_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-3"
              >
                Anthropic Console
              </a>
              . We check it with Anthropic before saving it.
            </p>
          </Field>

          <div className="flex gap-3">
            {replacing && (
              <Button
                type="button"
                variant="outline"
                className="h-11 cursor-pointer px-4"
                disabled={saving}
                onClick={() => {
                  setReplacing(false)
                  setApiKey("")
                  setError(null)
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="h-11 flex-1 cursor-pointer gap-2 text-sm font-medium"
              disabled={!apiKey.trim() || saving}
            >
              {saving && <SpinnerRing />}
              {saving ? "Checking with Anthropic…" : submitLabel}
            </Button>
          </div>
        </form>
      )}

      {!status.canManage && (
        <p className="text-sm text-muted-foreground">
          Only the workspace&apos;s owners and admins can change its API key.
        </p>
      )}
    </div>
  )
}

export { ApiKeyForm }
