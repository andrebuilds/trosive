import { StarIcon } from "lucide-react"

import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GitHubIcon } from "@/components/auth/provider-icons"

/**
 * The repo link with its star count. The count is fetched on the server
 * (`getStarCount` in `lib/github.ts`) and passed in, so this renders the same
 * from the site footer and the client-side dashboard header.
 */
function GitHubStarsButton({
  stars,
  className,
}: {
  stars: number | null
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      className={cn("h-8 gap-1.5 px-2.5", className)}
      render={
        <a
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Star ${siteConfig.name} on GitHub`}
        />
      }
      nativeButton={false}
    >
      <GitHubIcon className="size-4" />
      {stars !== null && (
        <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
          <StarIcon className="size-3.5 fill-current" />
          {stars}
        </span>
      )}
    </Button>
  )
}

export { GitHubStarsButton }
