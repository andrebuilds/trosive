import type { Metadata } from "next"

import { getWorkspaceKeyStatus } from "@/lib/api-keys"
import { requireOrganization, requireSession } from "@/lib/session"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApiKeyForm } from "@/components/api-key/api-key-form"
import { ByokPoints } from "@/components/api-key/byok-points"

export const metadata: Metadata = {
  title: "API key",
}

/**
 * `/app/settings/api-key`, the API key tab. Where the Billing tab used to be:
 * Trosive has no plans, and the workspace's own Anthropic key is what pays.
 */
export default async function ApiKeySettingsPage() {
  const session = await requireSession()
  const organization = await requireOrganization()
  const status = await getWorkspaceKeyStatus(organization.id, session.user.id)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Anthropic API key</CardTitle>
          <CardDescription>
            Every answer in {organization.name} runs on this key.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {status.source === "instance" && (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              This server has its own key set, so questions already work. Add
              one here to use your own instead.
            </p>
          )}
          <ApiKeyForm status={status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How bring your own key works</CardTitle>
        </CardHeader>
        <CardContent>
          <ByokPoints />
        </CardContent>
      </Card>
    </div>
  )
}
