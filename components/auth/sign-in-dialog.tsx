"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { signIn } from "@/lib/auth-client"
import type { SocialProviderId } from "@/lib/auth-providers"
import { checkEmailHref, MAGIC_LINK_REDIRECTS } from "@/lib/check-email"
import { APP_ROOT } from "@/lib/dashboard-nav"
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

/** Sign-in modal — `ui-design/landing/light/12-sign-in-modal.png`. */
function SignInDialog({
  open,
  onOpenChange,
  onSwitchToSignUp,
  socialProviders = [],
  callbackURL = APP_ROOT,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp: () => void
  /** Provider ids with credentials configured, resolved on the server. */
  socialProviders?: SocialProviderId[]
  /** Where social sign-in returns to. */
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

    // No passwords: the emailed link is the sign-in. An address without an
    // account gets a sign-up link instead, and the same inbox page.
    const email = String(form.get("email"))
    const { error: sendError } = await signIn.magicLink({
      email,
      ...MAGIC_LINK_REDIRECTS,
    })

    setPending(false)

    if (sendError) {
      setError(authErrorMessage(sendError, "Could not send the link."))
      return
    }

    handleOpenChange(false)
    router.push(checkEmailHref(email))
  }

  return (
    <AuthDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Sign in to Trosive"
      description="Welcome back, continue to your workspace"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <AuthSwitchButton onClick={onSwitchToSignUp}>
            Sign up
          </AuthSwitchButton>
        </>
      }
    >
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
            id="sign-in-email"
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
              Email me a link
            </AuthSubmitButton>
          </div>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            No password needed. The link signs you in.
          </p>
        </form>
      </div>
    </AuthDialogShell>
  )
}

export { SignInDialog }
