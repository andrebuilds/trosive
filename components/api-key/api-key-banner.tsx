import Link from "next/link"
import { KeyRoundIcon } from "lucide-react"

import { API_KEY_ROUTE, noKeyMessage, type ApiKeyStatus } from "@/lib/byok"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Shown wherever this workspace can't ask questions: no key yet, or the one it
 * had stopped working. Uploads and the library still work, so it informs
 * rather than blocks.
 *
 * `strip` runs under the dashboard header; `card` sits above a composer.
 */
function ApiKeyBanner({
  status,
  variant = "strip",
  className,
}: {
  status: ApiKeyStatus
  variant?: "strip" | "card"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 bg-muted/50 text-sm",
        variant === "strip" ? "border-b px-6 py-3" : "rounded-xl border p-3",
        className
      )}
    >
      <KeyRoundIcon className="size-4 shrink-0 text-muted-foreground" />
      <p className="min-w-0 flex-1">{noKeyMessage(status)}</p>
      {status.canManage && (
        <Button
          size="sm"
          className="cursor-pointer"
          render={<Link href={API_KEY_ROUTE} />}
          nativeButton={false}
        >
          {status.state === "invalid" ? "Replace key" : "Add API key"}
        </Button>
      )}
    </div>
  )
}

export { ApiKeyBanner }
