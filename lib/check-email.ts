import { APP_ROOT, ONBOARDING_ROUTE } from "@/lib/dashboard-nav"

/**
 * The "check your inbox" page. Signing in and signing up both end here while
 * the magic link is on its way, and a link that no longer works comes back
 * here with `?error=` to ask for a new one.
 */
export const CHECK_EMAIL_ROUTE = "/check-email"

/**
 * Where the magic link goes once opened. A new account starts onboarding; a
 * returning one goes to the app, which sends it on to onboarding anyway if it
 * never named a workspace.
 */
export const MAGIC_LINK_REDIRECTS = {
  callbackURL: APP_ROOT,
  newUserCallbackURL: ONBOARDING_ROUTE,
  errorCallbackURL: CHECK_EMAIL_ROUTE,
}

/**
 * The name rides along so "send it again" can pass it on: the account is only
 * created when a link is opened, and it takes the name from that link.
 */
export function checkEmailHref(email: string, name?: string) {
  const params = new URLSearchParams({ email })
  if (name) params.set("name", name)
  return `${CHECK_EMAIL_ROUTE}?${params}`
}
