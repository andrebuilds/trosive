"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { organization } from "@/lib/auth-client"
import {
  INVITABLE_ROLES,
  ROLE_DESCRIPTIONS,
  roleLabel,
  type InvitableRole,
} from "@/lib/workspace-roles"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authErrorMessage } from "@/components/auth/auth-errors"

const ROLE_OPTIONS = INVITABLE_ROLES.map((role) => ({
  value: role,
  label: roleLabel(role),
}))

/**
 * Email and role, and Better Auth sends the invitation through
 * `sendInvitationEmail` in `lib/auth.ts`. Inviting an address that already has
 * an invitation out replaces it, so this doubles as "invite again with a
 * different role".
 */
function InviteMemberForm({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<InvitableRole>("member")
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const address = email.trim()
    if (!address) return

    setPending(true)

    try {
      const { error } = await organization.inviteMember({
        email: address,
        role,
        organizationId,
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't send the invitation.",
          description: authErrorMessage(error, "Try again in a moment."),
        })
        return
      }

      toast.add({
        type: "success",
        title: `Invitation sent to ${address}.`,
        description: "They'll get an email with a link to join.",
      })

      setEmail("")
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't send the invitation.",
        description: "Check your connection and try again.",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            autoComplete="off"
            required
            disabled={pending}
          />
        </Field>

        <Field className="sm:w-36">
          <FieldLabel>Role</FieldLabel>
          <Select
            items={ROLE_OPTIONS}
            value={role}
            onValueChange={(value) => {
              if (value) setRole(value as InvitableRole)
            }}
            disabled={pending}
          >
            <SelectTrigger className="w-full" aria-label="Role">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Button
          type="submit"
          disabled={pending || !email.trim()}
          className="cursor-pointer"
        >
          {pending && <Spinner data-icon="inline-start" />}
          Send invite
        </Button>
      </div>

      <FieldDescription>{ROLE_DESCRIPTIONS[role]}</FieldDescription>
    </form>
  )
}

export { InviteMemberForm }
