import { LockKeyholeIcon, ReceiptTextIcon, SparklesIcon } from "lucide-react"

import { ANTHROPIC_LIMITS_URL } from "@/lib/byok"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

/**
 * What bring-your-own-key means, in three lines: why it's free, who bills you,
 * and what happens to the key. Shown beside the key form in onboarding and in
 * Settings, API key.
 */
function ByokPoints({ className }: { className?: string }) {
  const points = [
    {
      icon: SparklesIcon,
      title: "Free, with no limits",
      text: `${siteConfig.name} is open source. There are no plans and no question caps.`,
    },
    {
      icon: ReceiptTextIcon,
      title: "You pay Anthropic directly",
      text: (
        <>
          Answers run on your own key, at Anthropic&apos;s prices, with nothing
          added on top.{" "}
          <a
            href={ANTHROPIC_LIMITS_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-3"
          >
            Set a monthly spend limit
          </a>{" "}
          so there are no surprises.
        </>
      ),
    },
    {
      icon: LockKeyholeIcon,
      title: "Encrypted, never shown again",
      text: "The key is stored encrypted, used only to answer this workspace's questions, and you can remove it at any time.",
    },
  ]

  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {points.map((point) => (
        <li key={point.title} className="flex gap-3">
          <point.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="text-sm leading-relaxed">
            <p className="font-medium">{point.title}</p>
            <p className="text-muted-foreground">{point.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { ByokPoints }
