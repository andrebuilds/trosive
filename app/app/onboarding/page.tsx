import type { Metadata } from "next"

import { redirectIfOnboarded } from "@/lib/session"
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form"

export const metadata: Metadata = {
  title: "Name your organization",
}

/** First run — `ui-design/dashboard/light/dashboard-organisation.png`. */
export default async function OnboardingPage() {
  await redirectIfOnboarded()

  return <CreateOrganizationForm />
}
