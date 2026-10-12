"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CrownIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCogIcon,
  UserMinusIcon,
} from "lucide-react"

import { organization } from "@/lib/auth-client"
import { APP_ROOT } from "@/lib/dashboard-nav"
import type { MemberView } from "@/lib/members"
import {
  canManageWorkspace,
  INVITABLE_ROLES,
  isWorkspaceOwner,
  roleLabel,
  type InvitableRole,
  type WorkspaceRole,
} from "@/lib/workspace-roles"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { authErrorMessage } from "@/components/auth/auth-errors"

type Confirming = "remove" | "transfer" | "leave"

/**
 * The overflow menu at the end of a member row. What's in it depends on who's
 * looking:
 * - owners and admins change roles and remove people, never the owner;
 * - the owner can also hand the workspace to someone;
 * - anyone but the owner can leave.
 *
 * Better Auth checks all of this again on the server; the menu only hides what
 * would be refused.
 */
function MemberRowActions({
  member,
  organizationId,
  workspaceName,
  viewerId,
  viewerRole,
}: {
  member: MemberView
  organizationId: string
  workspaceName: string
  viewerId: string
  viewerRole: WorkspaceRole
}) {
  const router = useRouter()
  const [confirming, setConfirming] = React.useState<Confirming | null>(null)
  const [saving, setSaving] = React.useState(false)

  const name = member.name || member.email
  const isSelf = member.userId === viewerId
  const isOwnerRow = member.role === "owner"

  const canChangeRole = canManageWorkspace(viewerRole) && !isSelf && !isOwnerRow
  const canTransfer = isWorkspaceOwner(viewerRole) && !isSelf
  const canLeave = isSelf && !isOwnerRow

  if (!canChangeRole && !canTransfer && !canLeave) return null

  async function run(
    action: () => Promise<{ error: Parameters<typeof authErrorMessage>[0] }>,
    failure: string
  ) {
    setSaving(true)

    try {
      const { error } = await action()

      if (error) {
        toast.add({
          type: "error",
          title: failure,
          description: authErrorMessage(error, "Try again in a moment."),
        })
        return false
      }

      return true
    } catch {
      toast.add({
        type: "error",
        title: failure,
        description: "Check your connection and try again.",
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  async function changeRole(role: InvitableRole) {
    if (role === member.role) return

    const done = await run(
      () =>
        organization.updateMemberRole({
          memberId: member.id,
          role,
          organizationId,
        }),
      "Couldn't change that role."
    )

    if (!done) return

    toast.add({
      type: "success",
      title: `${name}'s role is now ${roleLabel(role)}.`,
    })
    router.refresh()
  }

  async function remove() {
    const done = await run(
      () =>
        organization.removeMember({
          memberIdOrEmail: member.id,
          organizationId,
        }),
      "Couldn't remove that member."
    )

    if (!done) return

    setConfirming(null)
    toast.add({
      type: "success",
      title: `${name} was removed from ${workspaceName}.`,
      description: "What they added to the workspace stays.",
    })
    router.refresh()
  }

  async function transfer() {
    const done = await run(async () => {
      const response = await fetch("/api/workspace/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      })

      if (response.ok) return { error: null }

      const body = await response.json().catch(() => null)
      return {
        error: { message: body?.error, status: response.status },
      }
    }, "Couldn't hand over the workspace.")

    if (!done) return

    setConfirming(null)
    toast.add({
      type: "success",
      title: `${name} now owns ${workspaceName}.`,
      description: "You're an admin of it from now on.",
    })
    router.refresh()
  }

  async function leave() {
    const done = await run(
      () => organization.leave({ organizationId }),
      "Couldn't leave the workspace."
    )

    if (!done) return

    setConfirming(null)
    toast.add({
      type: "success",
      title: `You left ${workspaceName}.`,
    })

    // Better Auth clears the active workspace; the app falls back to the
    // oldest one left, or to onboarding when there is none.
    router.push(APP_ROOT)
    router.refresh()
  }

  const CONFIRM: Record<
    Confirming,
    { title: string; body: string; button: string; run: () => void }
  > = {
    remove: {
      title: `Remove ${name}?`,
      body: `${name} will lose access to ${workspaceName} straight away. The documents and chats they added stay in the workspace.`,
      button: "Remove member",
      run: remove,
    },
    transfer: {
      title: `Make ${name} the owner?`,
      body: `${name} will own ${workspaceName}, including deleting it. You stay on as an admin. Only the new owner can hand it back.`,
      button: "Make owner",
      run: transfer,
    },
    leave: {
      title: `Leave ${workspaceName}?`,
      body: "You'll lose access to its documents and chats. Someone will have to invite you again to come back.",
      button: "Leave workspace",
      run: leave,
    },
  }

  const pending = confirming ? CONFIRM[confirming] : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-pointer text-muted-foreground"
              aria-label={`Actions for ${name}`}
              disabled={saving}
            >
              {saving ? <Spinner /> : <MoreVerticalIcon />}
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="w-52">
          {canChangeRole && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <UserCogIcon />
                Change role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={member.role}
                  onValueChange={(value) => changeRole(value as InvitableRole)}
                >
                  {INVITABLE_ROLES.map((role) => (
                    <DropdownMenuRadioItem
                      key={role}
                      value={role}
                      className="cursor-pointer"
                    >
                      {roleLabel(role)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {canTransfer && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setConfirming("transfer")}
            >
              <CrownIcon />
              Make owner
            </DropdownMenuItem>
          )}

          {canChangeRole && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setConfirming("remove")}
              >
                <UserMinusIcon />
                Remove from workspace
              </DropdownMenuItem>
            </>
          )}

          {canLeave && (
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setConfirming("leave")}
            >
              <LogOutIcon />
              Leave workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setConfirming(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pending?.body}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={pending?.run}
              className={
                confirming === "transfer"
                  ? undefined
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
            >
              {saving && <Spinner data-icon="inline-start" />}
              {pending?.button}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { MemberRowActions }
