import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MailIcon } from "lucide-react"

import { APP_ROOT } from "@/lib/dashboard-nav"
import { MAGIC_LINK_MINUTES } from "@/lib/email/templates"
import { getServerSession } from "@/lib/session"
import { CheckEmailForm } from "@/components/auth/check-email-form"

export const metadata: Metadata = {
  title: "Check your email",
}

/**
 * Two jobs. After the sign-in or sign-up dialog it's the "check your inbox"
 * screen, with the address in `?email=`. It's also where a magic link that no
 * longer works comes back to, with `?error=`, to ask for a new one. A link
 * that works never lands here: it goes straight to onboarding or the app.
 */
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string; error?: string }>
}) {
  const { email, name, error } = await searchParams

  // Signed in already, say from opening the link in another tab.
  if (await getServerSession()) {
    redirect(APP_ROOT)
  }

  if (error) {
    return (
      <div className="w-full max-w-100 rounded-xl bg-popover p-8 ring-1 ring-foreground/10">
        <div className="mb-6 flex flex-col gap-1.5 text-center">
          <h1 className="font-heading text-xl leading-tight font-bold">
            This link doesn&apos;t work
          </h1>
          <p className="text-sm text-muted-foreground">
            Links work once and expire after {MAGIC_LINK_MINUTES} minutes. Get a
            new one below.
          </p>
        </div>

        <CheckEmailForm />
        <BackHome />
      </div>
    )
  }

  return (
    <div className="w-full max-w-100 rounded-xl bg-popover p-8 ring-1 ring-foreground/10">
      <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <MailIcon className="size-6" />
        </span>
        <h1 className="font-heading text-xl leading-tight font-bold">
          Check your inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              We sent a link to{" "}
              <span className="font-medium break-all text-foreground">
                {email}
              </span>
            </>
          ) : (
            "We sent you a link to continue"
          )}
        </p>
      </div>

      <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
        Open it within {MAGIC_LINK_MINUTES} minutes to continue, no password
        needed. Nothing yet? Check your spam folder, or send it again.
      </p>

      <CheckEmailForm email={email} name={name} />
      <BackHome />
    </div>
  )
}

function BackHome() {
  return (
    <div className="mt-6 text-center text-sm text-muted-foreground">
      <Link
        href="/"
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to Trosive
      </Link>
    </div>
  )
}
