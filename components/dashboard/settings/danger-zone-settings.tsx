"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { APP_ROOT, type DashboardNavCounts } from "@/lib/dashboard-nav"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authErrorMessage } from "@/components/auth/auth-errors"

type ActionId =
  "clear-history" | "clear-library" | "delete-workspace" | "delete-account"

/** "12 chats" / "1 chat", and the same for documents. */
function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

/**
 * `DELETE` with the JSON body it may carry, or the message it failed with.
 *
 * Both clearing routes answer with a count and 401/403 through the same guard
 * as the rest of the API, so one helper covers them.
 */
async function clearAll(path: string) {
  const response = await fetch(path, { method: "DELETE" })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error ?? "Try again in a moment.")
  }

  return body as { chats?: number; documents?: number }
}

/**
 * The Danger zone tab — `ui-design/dashboard/light/dashboard-danger-zone.png`.
 *
 * Each row runs behind an `AlertDialog`, and the confirmation names what will
 * actually go: the counts come from the server so nobody confirms "delete
 * everything" without seeing how much everything is.
 *
 * Clearing the workspace is for owners and admins, deleting it for the owner
 * alone; the routes refuse anyone else, and the rows aren't shown to them.
 */
function DangerZoneSettings({
  counts,
  hasPassword,
  workspaceName,
  canManage,
  isOwner,
}: {
  counts: DashboardNavCounts
  /** False for an account that only ever signed in with Google or GitHub. */
  hasPassword: boolean
  workspaceName: string
  /** Owner or admin of the active workspace. */
  canManage: boolean
  isOwner: boolean
}) {
  const router = useRouter()

  const [confirming, setConfirming] = React.useState<ActionId | null>(null)
  const [running, setRunning] = React.useState(false)
  const [password, setPassword] = React.useState("")
  const [typedName, setTypedName] = React.useState("")

  function open(id: ActionId) {
    setPassword("")
    setTypedName("")
    setConfirming(id)
  }

  async function clearHistory() {
    const { chats = 0 } = await clearAll("/api/chats")

    toast.add({
      type: "success",
      title: `Deleted ${plural(chats, "chat")}.`,
      description: "Your documents are still in the library.",
    })

    // The sidebar counts and its history list are server-rendered, so they
    // keep the old rows until the tree is re-fetched.
    router.refresh()
  }

  async function clearLibrary() {
    const { documents = 0 } = await clearAll("/api/documents")

    toast.add({
      type: "success",
      title: `Deleted ${plural(documents, "document")}.`,
      description: "Chats keep their answers, but no longer open the sources.",
    })

    router.refresh()
  }

  async function deleteWorkspace() {
    const response = await fetch("/api/workspace", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: typedName.trim() }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error ?? "Try again in a moment.")
    }

    toast.add({
      type: "success",
      title: `Deleted ${workspaceName}.`,
      description: "Its chats, documents and API key are gone.",
    })

    // The app opens in another workspace of yours, or onboarding if this was
    // the last one.
    router.replace(APP_ROOT)
    router.refresh()
  }

  async function deleteAccount() {
    // Better Auth verifies the password itself, and takes the workspace's
    // chats and documents down with the account through `beforeDelete`.
    const { error } = await authClient.deleteUser(
      hasPassword ? { password } : {}
    )

    if (error) {
      throw new Error(
        authErrorMessage(error, "Check your password and try again.")
      )
    }

    toast.add({
      type: "success",
      title: "Your account has been deleted.",
      description: "So has every workspace nobody else was in.",
    })

    // The session cookie is already gone; `refresh` stops the signed-in tree
    // being served from the client cache on the way out.
    router.replace("/")
    router.refresh()
  }

  const ACTIONS = [
    {
      id: "clear-history" as const,
      title: "Clear chat history",
      description: "Delete every conversation. Your documents stay indexed.",
      action: "Clear history",
      destructive: false,
      visible: canManage,
      // Nothing to confirm when there's nothing there.
      disabled: counts.chats === 0,
      confirm: {
        title: "Clear your chat history?",
        body: `All ${plural(counts.chats, "chat")} in this workspace will be deleted along with their answers, and can't be recovered. This includes your teammates' chats. Your documents stay in the library.`,
        button: "Clear history",
        run: clearHistory,
        failure: "Couldn't clear your chat history.",
      },
    },
    {
      id: "clear-library" as const,
      title: "Clear all documents",
      description:
        "Delete every document and its embeddings from your library.",
      action: "Clear library",
      destructive: false,
      visible: canManage,
      disabled: counts.documents === 0,
      confirm: {
        title: "Clear your library?",
        body: `All ${plural(counts.documents, "document")} in this workspace will be removed and can't be recovered, including your teammates' uploads. Chats keep the answers already written, but the passages behind them will no longer open.`,
        button: "Clear library",
        run: clearLibrary,
        failure: "Couldn't clear your library.",
      },
    },
    {
      id: "delete-workspace" as const,
      title: "Delete workspace",
      description: `Permanently remove ${workspaceName} for everyone in it.`,
      action: "Delete workspace",
      destructive: true,
      visible: isOwner,
      disabled: false,
      confirm: {
        title: `Delete ${workspaceName}?`,
        body: `${workspaceName}, its ${plural(counts.chats, "chat")}, ${plural(counts.documents, "document")} and Anthropic key will be permanently deleted, and every member loses access. This can't be undone.`,
        button: "Delete workspace",
        run: deleteWorkspace,
        failure: "Couldn't delete the workspace.",
      },
    },
    {
      id: "delete-account" as const,
      title: "Delete account",
      description:
        "Permanently remove your account and every workspace only you are in.",
      action: "Delete account",
      destructive: true,
      visible: true,
      disabled: false,
      confirm: {
        title: "Delete your account?",
        body: "Your account will be permanently deleted, along with every workspace nobody else is in. Workspaces you share stay with their members, and if you own one, its longest-standing admin becomes the owner. This can't be undone.",
        button: "Delete account",
        run: deleteAccount,
        failure: "Couldn't delete your account.",
      },
    },
  ].filter((item) => item.visible)

  const pending = ACTIONS.find((item) => item.id === confirming)

  // The password is the only gate on an irreversible action, so an empty one
  // never reaches the server. Deleting a workspace asks for its name instead.
  const canConfirm =
    pending?.id === "delete-workspace"
      ? typedName.trim() === workspaceName
      : pending?.id !== "delete-account" || !hasPassword || password.length > 0

  async function confirm() {
    if (!pending || !canConfirm) return

    setRunning(true)

    try {
      await pending.confirm.run()
      setConfirming(null)
    } catch (error) {
      toast.add({
        type: "error",
        title: pending.confirm.failure,
        description:
          error instanceof Error
            ? error.message
            : "Check your connection and try again.",
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-destructive/50">
      <div className="bg-destructive/5 p-6">
        <h2 className="font-heading text-lg font-semibold text-destructive">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These actions are permanent and cannot be undone.
        </p>
      </div>

      <div className="divide-y border-t border-destructive/50">
        {ACTIONS.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 p-6"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            {item.destructive ? (
              <Button
                size="lg"
                className="cursor-pointer bg-destructive px-4 text-white hover:bg-destructive/90"
                onClick={() => open(item.id)}
              >
                {item.action}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                disabled={item.disabled}
                className="cursor-pointer border-destructive/50 px-4 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => open(item.id)}
              >
                {item.action}
              </Button>
            )}
          </div>
        ))}
      </div>

      <AlertDialog
        open={pending !== undefined}
        onOpenChange={(open) => {
          if (!open && !running) setConfirming(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.confirm.body}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pending?.id === "delete-workspace" && (
            <Field>
              <FieldLabel htmlFor="delete-workspace-name">
                Type{" "}
                <span className="font-semibold text-foreground">
                  {workspaceName}
                </span>{" "}
                to confirm
              </FieldLabel>
              <Input
                id="delete-workspace-name"
                autoComplete="off"
                value={typedName}
                disabled={running}
                onChange={(event) => setTypedName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") confirm()
                }}
              />
            </Field>
          )}

          {pending?.id === "delete-account" && hasPassword && (
            <Field>
              <FieldLabel htmlFor="delete-account-password">
                Confirm your password
              </FieldLabel>
              <Input
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={running}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") confirm()
                }}
              />
            </Field>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={running}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={running || !canConfirm}
              onClick={confirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {running && <Spinner data-icon="inline-start" />}
              {pending?.confirm.button}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { DangerZoneSettings }
