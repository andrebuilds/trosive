"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"

import { signIn } from "@/lib/auth-client"
import type { SocialProviderId } from "@/lib/auth-providers"
import { checkEmailHref, MAGIC_LINK_REDIRECTS } from "@/lib/check-email"
import { APP_ROOT } from "@/lib/dashboard-nav"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AuthDialogShell,
  AuthSwitchButton,
} from "@/components/auth/auth-dialog-shell"
import { authErrorMessage } from "@/components/auth/auth-errors"
import {
  AuthDivider,
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "@/components/auth/auth-form-parts"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"

/** Registration modal — `ui-design/landing/light/13-sign-up-modal.png`. */
function SignUpDialog({
  open,
  onOpenChange,
  onSwitchToSignIn,
  socialProviders = [],
  allowSignUps = true,
  callbackURL = APP_ROOT,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignIn: () => void
  /** Provider ids with credentials configured, resolved on the server. */
  socialProviders?: SocialProviderId[]
  /** False while an admin has registration closed — see the Security tab. */
  allowSignUps?: boolean
  /** Where social sign-up returns to. The email link goes to onboarding. */
  callbackURL?: string
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) setError(null)
    onOpenChange(next)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)

    // No password: the account is created when the emailed link is opened,
    // which also proves the address. The link then starts onboarding.
    const name = String(form.get("name")).trim()
    const email = String(form.get("email"))
    const { error: sendError } = await signIn.magicLink({
      email,
      name,
      ...MAGIC_LINK_REDIRECTS,
    })

    setPending(false)

    if (sendError) {
      setError(authErrorMessage(sendError, "Could not create your account."))
      return
    }

    // An address that already has an account gets a sign-in link and the
    // same inbox page, so this never reveals who's registered.
    handleOpenChange(false)
    router.push(checkEmailHref(email, name))
  }

  return (
    <AuthDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Create your account"
      description="to start chatting with your documents"
      footer={
        <>
          Already have an account?{" "}
          <AuthSwitchButton onClick={onSwitchToSignIn}>
            Sign in
          </AuthSwitchButton>
        </>
      }
    >
      {!allowSignUps ? (
        // The server refuses these anyway; showing the form first would only
        // collect details on the way to being told no.
        <Alert>
          <LockIcon />
          <AlertTitle>New sign-ups are closed right now.</AlertTitle>
          <AlertDescription>
            Trosive isn&apos;t accepting new accounts at the moment. If you
            already have one, sign in instead.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col gap-5">
          <SocialAuthButtons
            providers={socialProviders}
            callbackURL={callbackURL}
            disabled={pending}
            onError={(message) => setError(message || null)}
          />
          {socialProviders.length > 0 && <AuthDivider />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthFormError>{error}</AuthFormError>

            <AuthField
              id="sign-up-name"
              name="name"
              label="Full name"
              placeholder="Ada Lovelace"
              autoComplete="name"
              required
              disabled={pending}
            />
            <AuthField
              id="sign-up-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@company.com"
              autoComplete="email"
              required
              disabled={pending}
            />

            <div className="mt-1">
              <AuthSubmitButton pending={pending}>
                Create account
              </AuthSubmitButton>
            </div>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              No password needed. We&apos;ll email you a link to confirm your
              address.
            </p>
          </form>
        </div>
      )}
    </AuthDialogShell>
  )
}

export { SignUpDialog }
