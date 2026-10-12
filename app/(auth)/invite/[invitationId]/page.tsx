import type { Metadata } from "next"
import Link from "next/link"
import { UsersIcon } from "lucide-react"

import { findInvitation } from "@/lib/invitations"
import { getServerSession } from "@/lib/session"
import {
  InvitationResponse,
  InvitationSignIn,
  InvitationSwitchAccount,
} from "@/components/workspace/invitation-actions"

export const metadata: Metadata = {
  title: "Join a workspace",
}

const DEAD_LINK = {
  expired: {
    title: "This invitation has expired",
    body: "Invitations work for seven days. Ask whoever invited you to send a new one.",
  },
  used: {
    title: "This invitation can't be used",
    body: "It was already accepted, declined or withdrawn. If you still need in, ask for a new one.",
  },
  missing: {
    title: "This invitation doesn't exist",
    body: "Check that the link is complete, or ask for a new invitation.",
  },
}

/**
 * Where an invitation email's button lands, signed in or not. Outside `/app`
 * on purpose: the proxy turns signed-out visitors away from there, and most
 * people opening this don't have an account yet.
 *
 * Shows the workspace, who invited and the role, and nothing else about the
 * workspace until the invitation is accepted.
 */
export default async function InvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>
}) {
  const { invitationId } = await params
  const [found, session] = await Promise.all([
    findInvitation(invitationId),
    getServerSession(),
  ])

  if (found.state !== "open") {
    const copy = DEAD_LINK[found.state]

    return (
      <InvitationCard title={copy.title} description={copy.body}>
        <BackHome />
      </InvitationCard>
    )
  }

  const { invitation } = found
  const signedInAs = session?.user.email.toLowerCase()

  return (
    <InvitationCard
      title={`Join ${invitation.workspaceName}`}
      description={
        <>
          {invitation.inviterName} invited you to join as{" "}
          {invitation.roleLabel === "Admin" ? "an" : "a"}{" "}
          <span className="font-medium text-foreground">
            {invitation.roleLabel}
          </span>
          .
        </>
      }
    >
      {!signedInAs ? (
        <InvitationSignIn invitationId={invitation.id} email={invitation.email} />
      ) : signedInAs === invitation.email.toLowerCase() ? (
        <InvitationResponse invitationId={invitation.id} />
      ) : (
        <>
          <p className="mb-4 text-center text-sm leading-relaxed text-muted-foreground">
            This invitation is for{" "}
            <span className="font-medium break-all text-foreground">
              {invitation.email}
            </span>
            , but you&apos;re signed in as{" "}
            <span className="font-medium break-all text-foreground">
              {session?.user.email}
            </span>
            . Sign out, then open the link again.
          </p>
          <InvitationSwitchAccount />
        </>
      )}
    </InvitationCard>
  )
}

function InvitationCard({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="w-full max-w-100 rounded-xl bg-popover p-8 ring-1 ring-foreground/10">
      <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <UsersIcon className="size-6" />
        </span>
        <h1 className="font-heading text-xl leading-tight font-bold">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  )
}

function BackHome() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <Link
        href="/"
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to Trosive
      </Link>
    </div>
  )
}
