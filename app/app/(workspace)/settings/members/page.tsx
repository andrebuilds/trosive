import type { Metadata } from "next"

import { listMembers, listPendingInvitations } from "@/lib/members"
import { requireOrganization, requireSession } from "@/lib/session"
import { canManageWorkspace, roleLabel } from "@/lib/workspace-roles"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserAvatar } from "@/components/auth/user-avatar"
import { InvitationRowActions } from "@/components/dashboard/settings/members/invitation-row-actions"
import { InviteMemberForm } from "@/components/dashboard/settings/members/invite-member-form"
import { MemberRowActions } from "@/components/dashboard/settings/members/member-row-actions"

export const metadata: Metadata = {
  title: "Members",
}

/** "Oct 12, 2026". */
function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * `/app/settings/members`, the Members tab. Everyone sees who's in the
 * workspace; only owners and admins see the invite form and the invitations
 * still out.
 */
export default async function MembersSettingsPage() {
  const session = await requireSession()
  const workspace = await requireOrganization()
  const canManage = canManageWorkspace(workspace.role)

  const [members, invitations] = await Promise.all([
    listMembers(workspace.id),
    canManage ? listPendingInvitations(workspace.id) : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Invite people</CardTitle>
            <CardDescription>
              They&apos;ll get an email with a link to join {workspace.name}.
              Everyone shares its documents, chats and Anthropic key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteMemberForm organizationId={workspace.id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {members.length === 1
              ? `You're the only one in ${workspace.name} so far.`
              : `${members.length} people in ${workspace.name}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <ul className="divide-y border-t">
            {members.map((member) => {
              const isSelf = member.userId === session.user.id

              return (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <UserAvatar
                    user={member}
                    className="size-9 **:data-[slot=avatar-fallback]:bg-muted **:data-[slot=avatar-fallback]:text-muted-foreground"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {member.name || member.email}
                      {isSelf && (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>

                  <p className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                    Joined {shortDate(member.joinedAt)}
                  </p>

                  <Badge
                    variant={member.role === "member" ? "outline" : undefined}
                    className={cn(
                      "w-16 shrink-0 rounded-md text-[0.6875rem] font-bold",
                      member.role === "owner" && "bg-brand/15 text-brand",
                      member.role === "admin" &&
                        "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {roleLabel(member.role)}
                  </Badge>

                  <div className="flex w-8 shrink-0 justify-end">
                    <MemberRowActions
                      member={member}
                      organizationId={workspace.id}
                      workspaceName={workspace.name}
                      viewerId={session.user.id}
                      viewerRole={workspace.role}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {canManage && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Sent but not accepted yet. Each link works for seven days.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y border-t">
              {invitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{invitation.email}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      Invited by {invitation.inviterName}
                    </p>
                  </div>

                  <p className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                    Expires {shortDate(invitation.expiresAt)}
                  </p>

                  <Badge
                    variant="outline"
                    className="w-16 shrink-0 rounded-md text-[0.6875rem] font-bold"
                  >
                    {roleLabel(invitation.role)}
                  </Badge>

                  <div className="flex w-8 shrink-0 justify-end">
                    <InvitationRowActions
                      invitation={invitation}
                      organizationId={workspace.id}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
