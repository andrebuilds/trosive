"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MailIcon } from "lucide-react"

import { organization, signIn, signOut } from "@/lib/auth-client"
import { CHECK_EMAIL_ROUTE } from "@/lib/check-email"
import { APP_ROOT, invitationRoute } from "@/lib/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authErrorMessage } from "@/components/auth/auth-errors"
import {
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "@/components/auth/auth-form-parts"

/** Seconds before the link can be sent again. The server allows three a minute. */
const RESEND_COOLDOWN = 30

/**
 * Signed out: a magic link to the invited address, which comes back to this
 * page signed in. The address is fixed, because only that inbox can accept.
 * The name is only used if this creates the account.
 */
function InvitationSignIn({
  invitationId,
  email,
}: {
  invitationId: string
  email: string
}) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = String(new FormData(event.currentTarget).get("name") ?? "")
    const back = invitationRoute(invitationId)

    setPending(true)
    setError(null)

    const { error: sendError } = await signIn.magicLink({
      email,
      name: name.trim() || undefined,
      callbackURL: back,
      newUserCallbackURL: back,
      errorCallbackURL: CHECK_EMAIL_ROUTE,
    })

    setPending(false)

    if (sendError) {
      setError(authErrorMessage(sendError, "Could not send the link."))
      return
    }

    setSent(true)
    setCooldown(RESEND_COOLDOWN)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthFormError>{error}</AuthFormError>

      {sent ? (
        <>
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            We sent a link to{" "}
            <span className="font-medium break-all text-foreground">
              {email}
            </span>
            . Open it to come back here signed in.
          </p>
          <Button
            type="submit"
            variant="outline"
            disabled={pending || cooldown > 0}
            className="h-11 w-full gap-2 text-sm font-medium"
          >
            {pending ? <Spinner /> : <MailIcon />}
            <span aria-live="polite">
              {cooldown > 0
                ? `Sent. Send again in ${cooldown}s`
                : "Send the link again"}
            </span>
          </Button>
        </>
      ) : (
        <>
          <AuthField
            id="invite-name"
            name="name"
            label="Your name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            disabled={pending}
          />
          <AuthSubmitButton pending={pending}>
            Continue as {email}
          </AuthSubmitButton>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            No password needed. We&apos;ll email you a link to confirm it&apos;s
            you.
          </p>
        </>
      )}
    </form>
  )
}

/** Signed in as the invited address: join, or turn it down. */
function InvitationResponse({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState<"accept" | "reject" | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function respond(choice: "accept" | "reject") {
    setPending(choice)
    setError(null)

    const { error: responseError } =
      choice === "accept"
        ? await organization.acceptInvitation({ invitationId })
        : await organization.rejectInvitation({ invitationId })

    if (responseError) {
      setPending(null)
      setError(authErrorMessage(responseError, "Try again in a moment."))
      return
    }

    // Accepting makes the workspace the active one, so the app opens in it.
    // Declining lands in the app too, which sends anyone without a workspace
    // on to onboarding.
    router.replace(APP_ROOT)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <AuthFormError>{error}</AuthFormError>

      <Button
        disabled={pending !== null}
        onClick={() => respond("accept")}
        className="h-11 w-full cursor-pointer gap-2 text-sm font-medium"
      >
        {pending === "accept" && <Spinner />}
        Accept invitation
      </Button>
      <Button
        variant="outline"
        disabled={pending !== null}
        onClick={() => respond("reject")}
        className="h-11 w-full cursor-pointer gap-2 text-sm font-medium"
      >
        {pending === "reject" && <Spinner />}
        Decline
      </Button>
    </div>
  )
}

/** Signed in as someone else: the way out is signing out. */
function InvitationSwitchAccount() {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function handleSignOut() {
    setPending(true)
    await signOut()
    // Back to this page, now signed out, where it offers the right link.
    router.refresh()
    setPending(false)
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={handleSignOut}
      className="h-11 w-full cursor-pointer gap-2 text-sm font-medium"
    >
      {pending && <Spinner />}
      Sign out
    </Button>
  )
}

export { InvitationResponse, InvitationSignIn, InvitationSwitchAccount }
