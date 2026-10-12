import { apiKeyLabel, canAsk, type ApiKeyStatus } from "@/lib/byok"
import { cn } from "@/lib/utils"

/**
 * "Your API key" under the user's name in both sidebars, with a dot that turns
 * red when questions can't be asked. Where the plan name used to be: Trosive
 * has no plans, only the workspace's own key.
 */
function ApiKeyLine({ status }: { status: ApiKeyStatus }) {
  const ready = canAsk(status)

  return (
    <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          ready ? "bg-emerald-500" : "bg-destructive"
        )}
      />
      {apiKeyLabel(status)}
    </span>
  )
}

export { ApiKeyLine }
