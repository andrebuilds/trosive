"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { ONBOARDING_API_KEY_ROUTE } from "@/lib/dashboard-nav"
import { createWorkspace } from "@/lib/organization-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/**
 * A new workspace from the switcher. It starts empty and becomes the active
 * one, so the next stop is the same key step onboarding ends with: answers in
 * a workspace run on that workspace's own Anthropic key.
 */
function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (pending) return
    if (!next) {
      setName("")
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const workspace = name.trim()
    if (!workspace) return

    setPending(true)
    setError(null)

    const result = await createWorkspace(workspace)

    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }

    // Stays pending through the navigation, like onboarding: the workspace
    // exists, and an empty form flashing back would read as a failure.
    router.push(ONBOARDING_API_KEY_ROUTE)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Create a workspace</DialogTitle>
            <DialogDescription>
              Its own documents, chats, members and Anthropic key. You can
              switch between workspaces at any time.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Field>
            <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
            <Input
              id="workspace-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Meridian Capital"
              autoComplete="organization"
              autoFocus
              required
              maxLength={64}
              disabled={pending}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !name.trim()}
              className="cursor-pointer"
            >
              {pending && <Spinner data-icon="inline-start" />}
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateWorkspaceDialog }
