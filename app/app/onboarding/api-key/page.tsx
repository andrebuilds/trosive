import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getWorkspaceKeyStatus } from "@/lib/api-keys"
import { APP_ROOT } from "@/lib/dashboard-nav"
import { requireOrganization, requireSession } from "@/lib/session"
import { ApiKeyStep } from "@/components/onboarding/api-key-step"

export const metadata: Metadata = {
  title: "Bring your own API key",
}

/**
 * Onboarding, step two. Needs the workspace step one created; without one,
 * `requireOrganization` sends the user back there.
 */
export default async function OnboardingApiKeyPage() {
  const session = await requireSession()
  const organization = await requireOrganization()
  const status = await getWorkspaceKeyStatus(organization.id, session.user.id)

  // A self-hosted instance key already answers for this workspace, and a
  // member who can't set the key has nothing to do here.
  if (status.source === "instance" || !status.canManage) {
    redirect(APP_ROOT)
  }

  return <ApiKeyStep status={status} />
}
