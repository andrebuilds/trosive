"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, UsersIcon } from "lucide-react"

import { invitationRoute, ONBOARDING_API_KEY_ROUTE } from "@/lib/dashboard-nav"
import type { InvitationSummary } from "@/lib/invitations"
import { createWorkspace } from "@/lib/organization-client"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TrosiveMark } from "@/components/brand/trosive-logo"
import { OrganizationSetupLoading } from "@/components/onboarding/organization-setup-loading"

/**
 * The first thing a new user sees — `ui-design/dashboard/light/
 * dashboard-organisation.png`. Creating the organization also makes it the
 * active one, which is what `/app` reads to fill the sidebar.
 *
 * Someone who signed up from an invitation, or was invited later, sees it
 * above the form, so joining doesn't mean creating a workspace first.
 */
function CreateOrganizationForm({
  invitations = [],
}: {
  invitations?: InvitationSummary[]
}) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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

    // On to step two, the Anthropic key. Stay on the loading state through
    // the navigation: the workspace is ready, and flashing the empty form back
    // would read as a failure.
    router.replace(ONBOARDING_API_KEY_ROUTE)
    router.refresh()
  }

  if (pending) {
    return <OrganizationSetupLoading name={name.trim()} />
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-24 pb-16">
      <TrosiveMark className="size-12" />

      <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
        Name your organization
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        This is your workspace for documents, chats, and teammates. You can
        change it later in Settings.
      </p>

      {invitations.length > 0 && (
        <ul className="mt-8 flex flex-col gap-2">
          {invitations.map((invitation) => (
            <li key={invitation.id}>
              <Link
                href={invitationRoute(invitation.id)}
                className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/5 px-4 py-3 transition-colors hover:bg-brand/10"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <UsersIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    You have an invitation to {invitation.workspaceName}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    From {invitation.inviterName}, as{" "}
                    {invitation.roleLabel === "Admin" ? "an" : "a"}{" "}
                    {invitation.roleLabel}
                  </span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="organization-name">Organization name</FieldLabel>
          <Input
            id="organization-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Meridian Capital"
            autoComplete="organization"
            autoFocus
            required
            maxLength={64}
            className="h-11"
          />
        </Field>

        <Button
          type="submit"
          disabled={!name.trim()}
          className="h-11 w-full cursor-pointer gap-2 text-sm font-medium"
        >
          Continue
          <ArrowRightIcon />
        </Button>
      </form>
    </div>
  )
}

export { CreateOrganizationForm }
