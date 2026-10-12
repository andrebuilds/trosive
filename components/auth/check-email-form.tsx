"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MailIcon } from "lucide-react"

import { signIn } from "@/lib/auth-client"
import { checkEmailHref, MAGIC_LINK_REDIRECTS } from "@/lib/check-email"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authErrorMessage } from "@/components/auth/auth-errors"
import {
  AuthField,
  AuthFormError,
  AuthSubmitButton,
} from "@/components/auth/auth-form-parts"

/** Seconds before the button works again. The server allows three a minute. */
const RESEND_COOLDOWN = 30

/**
 * Mails a fresh magic link. With a known address it's a single button; after
 * a dead link there's nothing to read the address from, so it asks.
 */
function CheckEmailForm({ email, name }: { email?: string; name?: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const address =
      email ?? String(new FormData(event.currentTarget).get("email"))
    setPending(true)
    setError(null)

    const { error: sendError } = await signIn.magicLink({
      email: address,
      name,
      ...MAGIC_LINK_REDIRECTS,
    })

    setPending(false)

    if (sendError) {
      setError(authErrorMessage(sendError, "Could not send the link."))
      return
    }

    setCooldown(RESEND_COOLDOWN)

    // Typed in after a dead link: turn the page into "check your inbox".
    if (!email) router.replace(checkEmailHref(address))
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthFormError>{error}</AuthFormError>

      {email ? (
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
      ) : (
        <>
          <AuthField
            id="check-email"
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
              Send a new link
            </AuthSubmitButton>
          </div>
        </>
      )}
    </form>
  )
}

export { CheckEmailForm }
