import type { Metadata } from "next"
import Link from "next/link"

import { APP_ROOT } from "@/lib/dashboard-nav"
import { getServerSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { TrosiveLogo } from "@/components/brand/trosive-logo"

export const metadata: Metadata = {
  title: "Page not found",
}

/**
 * Every 404: unknown URLs, and `notFound()` from a page, such as a chat that
 * was deleted or belongs to another workspace. Same chrome as the auth
 * screens. The way out depends on who's looking: the dashboard if they're
 * signed in, the landing page if not.
 */
export default async function NotFound() {
  const session = await getServerSession()
  const home = session ? APP_ROOT : "/"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16">
      <Link href={home} aria-label="Trosive home">
        <TrosiveLogo />
      </Link>

      <div className="w-full max-w-100 rounded-xl bg-popover p-8 text-center ring-1 ring-foreground/10">
        <p className="font-heading text-6xl font-bold tracking-tight text-brand">
          404
        </p>
        <h1 className="mt-4 font-heading text-xl leading-tight font-bold">
          Page not found
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {session
            ? "The link may be old, or what it pointed to was deleted or lives in another workspace."
            : "The link may be old, or the page has moved."}
        </p>

        <Button
          size="lg"
          className="mt-6 w-full cursor-pointer"
          render={<Link href={home} />}
          nativeButton={false}
        >
          {session ? "Go to dashboard" : "Back to home"}
        </Button>
      </div>
    </div>
  )
}
