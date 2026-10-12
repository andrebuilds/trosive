import Link from "next/link"

import { getWorkspaceKeyStatus } from "@/lib/api-keys"
import {
  API_KEY_ROUTE,
  apiKeyLabel,
  canAsk,
  type ApiKeyStatus,
} from "@/lib/byok"
import { getWorkspaceStats } from "@/lib/chat-store"
import { requireOrganization, requireSession } from "@/lib/session"
import { cn } from "@/lib/utils"

/** The API key tile's one word. */
function keyTileValue(status: ApiKeyStatus) {
  if (status.source === "instance") return "Server key"
  if (status.source === null) return "Missing"
  return status.state === "invalid" ? "Not working" : "Connected"
}

function StatTile({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

/**
 * The headline numbers, `ui-design/dashboard/light/dashboard-home.png`.
 *
 * Three tiles, each a single current value. Values use proportional figures
 * (`tabular-nums` is for columns that must align, not for standalone numbers).
 * The reference's plan tile is the API key here: Trosive has no plans, and
 * the key is what decides whether questions can be asked.
 */
async function HomeStats() {
  const session = await requireSession()
  const organization = await requireOrganization()
  const [
    { documentsIndexed, documentsPending, questionsThisMonth },
    keyStatus,
  ] = await Promise.all([
    getWorkspaceStats(organization.id),
    getWorkspaceKeyStatus(organization.id, session.user.id),
  ])
  const ready = canAsk(keyStatus)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile label="Documents indexed">
        <span className="text-3xl font-bold tracking-tight">
          {documentsIndexed}
        </span>

        {documentsPending > 0 && (
          <span className="text-sm text-muted-foreground">
            {documentsPending} still being read
          </span>
        )}
      </StatTile>

      <StatTile label="Questions this month">
        <span className="text-3xl font-bold tracking-tight">
          {questionsThisMonth}
        </span>
        <span className="text-sm text-muted-foreground">
          No limits, on your own API key
        </span>
      </StatTile>

      <StatTile label="API key">
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "text-3xl font-bold tracking-tight",
              !ready && "text-destructive"
            )}
          >
            {keyTileValue(keyStatus)}
          </span>
          <Link
            href={API_KEY_ROUTE}
            className="rounded-md bg-brand/15 px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/25"
          >
            {ready
              ? "Manage"
              : keyStatus.state === "invalid"
                ? "Replace"
                : "Add"}
          </Link>
        </span>
        <span className="text-sm text-muted-foreground">
          {keyStatus.hint ?? apiKeyLabel(keyStatus)}
        </span>
      </StatTile>
    </div>
  )
}

export { HomeStats }
