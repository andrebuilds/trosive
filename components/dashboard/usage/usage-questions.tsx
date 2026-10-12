import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { API_KEY_ROUTE } from "@/lib/byok"
import { Button } from "@/components/ui/button"

/**
 * The headline card on the usage page, `ui-design/dashboard/light/usage-page.png`.
 *
 * The reference draws a meter against a plan's limit. Trosive has neither: it
 * shows what was asked and says who pays for it, the workspace's own key.
 */
function UsageQuestions({ questions }: { questions: number }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Questions this month</p>

          <p className="mt-1 text-4xl font-bold tracking-tight">
            {questions}
            <span className="ml-1.5 text-lg font-normal text-muted-foreground">
              of unlimited
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          className="cursor-pointer"
          render={<Link href={API_KEY_ROUTE} />}
        >
          API key
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Each answer runs on your workspace&apos;s Anthropic API key. The
        Anthropic Console shows what they cost.
      </p>
    </div>
  )
}

export { UsageQuestions }
