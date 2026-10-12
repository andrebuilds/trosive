"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MailIcon, MoreVerticalIcon, XIcon } from "lucide-react"

import { organization } from "@/lib/auth-client"
import type { PendingInvitationView } from "@/lib/members"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authErrorMessage } from "@/components/auth/auth-errors"

/**
 * Resend or revoke an invitation that hasn't been answered. Resending keeps
 * the same link and restarts its seven days; revoking makes the link say the
 * invitation was withdrawn.
 */
function InvitationRowActions({
  invitation,
  organizationId,
}: {
  invitation: PendingInvitationView
  organizationId: string
}) {
  const router = useRouter()
  const [saving, setSaving] = React.useState(false)

  async function resend() {
    setSaving(true)

    try {
      const { error } = await organization.inviteMember({
        email: invitation.email,
        role: invitation.role === "admin" ? "admin" : "member",
        organizationId,
        resend: true,
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't resend the invitation.",
          description: authErrorMessage(error, "Try again in a moment."),
        })
        return
      }

      toast.add({
        type: "success",
        title: `Invitation sent again to ${invitation.email}.`,
        description: "The link works for another seven days.",
      })
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't resend the invitation.",
        description: "Check your connection and try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  async function revoke() {
    setSaving(true)

    try {
      const { error } = await organization.cancelInvitation({
        invitationId: invitation.id,
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Couldn't revoke the invitation.",
          description: authErrorMessage(error, "Try again in a moment."),
        })
        return
      }

      toast.add({
        type: "success",
        title: `Invitation to ${invitation.email} revoked.`,
        description: "The link in their email no longer works.",
      })
      router.refresh()
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't revoke the invitation.",
        description: "Check your connection and try again.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer text-muted-foreground"
            aria-label={`Actions for the invitation to ${invitation.email}`}
            disabled={saving}
          >
            {saving ? <Spinner /> : <MoreVerticalIcon />}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="cursor-pointer" onClick={resend}>
          <MailIcon />
          Resend invitation
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={revoke}
        >
          <XIcon />
          Revoke invitation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { InvitationRowActions }
