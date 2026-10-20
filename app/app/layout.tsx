import type { Metadata } from "next"

import { getAppSettings } from "@/lib/app-settings-store"
import { isCurrentUserAdmin, requireSession } from "@/lib/session"
import { MaintenanceNotice } from "@/components/admin/maintenance-notice"

// Private by definition. robots.txt already keeps crawlers out; this covers a
// URL that gets indexed anyway because someone linked to it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * The signed-in boundary. Chrome lives one level down — `(workspace)` gets the
 * sidebar, `onboarding` gets none — because a user without a
 * workspace has nothing to navigate to yet.
 */
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Here rather than in each page, so a new route under /app is protected the
  // moment it exists. `proxy.ts` turns most signed-out traffic away first.
  await requireSession()

  // Maintenance mode, enforced at the one boundary the whole product is behind.
  // Admins are let through on purpose: somebody has to be able to reach the
  // console and turn it back off.
  const { maintenanceMode } = await getAppSettings()

  if (maintenanceMode && !(await isCurrentUserAdmin())) {
    return <MaintenanceNotice />
  }

  return children
}
