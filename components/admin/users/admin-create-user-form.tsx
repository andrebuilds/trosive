"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { TriangleAlertIcon } from "lucide-react"

import { adminUsersHref } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

type CreatedUser = {
  email: string
  warning?: string
}

/**
 * The panel that replaces the form once an account exists. There's no
 * password to hand over: the welcome email is already on its way, and they
 * sign in with Google, GitHub or an emailed link like everyone else.
 */
function CreatedPanel({
  created,
  onCreateAnother,
}: {
  created: CreatedUser
  onCreateAnother: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-heading text-lg font-semibold">Account created</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent {created.email} a welcome email. They sign in with that
          address, using an emailed link or Google or GitHub.
        </p>
      </div>

      {created.warning && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{created.warning}</span>
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer px-4"
          onClick={onCreateAnother}
        >
          Create another
        </Button>

        <Button
          size="lg"
          nativeButton={false}
          className="cursor-pointer px-4"
          render={<a href={adminUsersHref()} />}
        >
          Back to users
        </Button>
      </div>
    </div>
  )
}

/**
 * "Create a user" — `ui-design/dashboard/light/admin-add-user-page.png`.
 *
 * The form collects; the server decides. Every value here is validated again in
 * `POST /api/admin/users`, which is also where the caller's admin role is
 * checked: this component being reachable is never the reason a user gets
 * created.
 */
function AdminCreateUserForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [created, setCreated] = React.useState<CreatedUser | null>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")

  function reset() {
    setCreated(null)
    setError(null)
    setName("")
    setEmail("")
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok && response.status !== 207) {
        setError(payload?.error ?? "Try again in a moment.")
        return
      }

      setCreated({
        email: payload.email,
        warning: payload.warning,
      })

      // The users table is server-rendered, so it keeps the old rows until the
      // tree is re-fetched.
      router.refresh()
    } catch {
      setError("Check your connection and try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (created) {
    return <CreatedPanel created={created} onCreateAnother={reset} />
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <h3 className="font-heading text-lg font-semibold">Create a user</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a user directly. They get a welcome email and sign in with this
          address, no password needed.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="admin-new-name">Username</FieldLabel>
        <Input
          id="admin-new-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="ada.lovelace"
          autoComplete="off"
          required
          disabled={isSaving}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="admin-new-email">Email address</FieldLabel>
        <Input
          id="admin-new-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ada@company.com"
          autoComplete="off"
          required
          disabled={isSaving}
        />
      </Field>

      <p className="text-sm text-muted-foreground">
        Their workspace starts without an Anthropic API key. They add their own
        in Settings, API key, before asking questions.
      </p>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          nativeButton={false}
          className="cursor-pointer px-4"
          render={<a href={adminUsersHref()} />}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          size="lg"
          className="cursor-pointer px-4"
          disabled={isSaving}
        >
          {isSaving && <Spinner data-icon="inline-start" />}
          Create user
        </Button>
      </div>
    </form>
  )
}

export { AdminCreateUserForm }
