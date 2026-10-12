import type { Metadata } from "next"

import { openInvitationsFor } from "@/lib/invitations"
import { redirectIfOnboarded, requireSession } from "@/lib/session"
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form"

export const metadata: Metadata = {
  title: "Name your organization",
}

/** First run — `ui-design/dashboard/light/dashboard-organisation.png`. */
export default async function OnboardingPage() {
  await redirectIfOnboarded()

  const session = await requireSession()
  const invitations = await openInvitationsFor(session.user.email)

  return <CreateOrganizationForm invitations={invitations} />
}
