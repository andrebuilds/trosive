"use client"

import { LogInIcon, UserPlusIcon } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDialogTrigger } from "@/components/auth/auth-dialog-trigger"
import { UserMenu } from "@/components/auth/user-menu"

/**
 * The header's right-hand pair: sign-in / sign-up triggers when signed out,
 * the account menu when signed in. Both show at every width, since the header
 * has nothing else to fit.
 */
function AuthHeaderActions() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <Skeleton className="h-8 w-40 rounded-lg" />
  }

  if (session) {
    return <UserMenu user={session.user} />
  }

  return (
    <div className="flex items-center gap-2">
      {/* On phones the logo and both buttons only just fit, so the sign-in
          icon waits for `sm`. */}
      <AuthDialogTrigger mode="sign-in" variant="ghost">
        <LogInIcon data-icon="inline-start" className="max-sm:hidden" />
        Sign in
      </AuthDialogTrigger>
      <AuthDialogTrigger mode="sign-up">
        <UserPlusIcon data-icon="inline-start" />
        Sign up
      </AuthDialogTrigger>
      {/* The previous call to action, from when the header had section links:
      <AuthDialogTrigger mode="sign-up">
        Try Trosive free
        <ArrowRightIcon
          data-icon="inline-end"
          className="transition-transform group-hover/button:translate-x-0.5"
        />
      </AuthDialogTrigger> */}
    </div>
  )
}

export { AuthHeaderActions }
