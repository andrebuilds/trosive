"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import type { ApiKeyStatus } from "@/lib/byok"
import { APP_ROOT } from "@/lib/dashboard-nav"
import { Button } from "@/components/ui/button"
import { ApiKeyForm } from "@/components/api-key/api-key-form"
import { ByokPoints } from "@/components/api-key/byok-points"
import { TrosiveMark } from "@/components/brand/trosive-logo"

/**
 * Onboarding, step two: the workspace's Anthropic key. Same frame as step one.
 *
 * Skippable on purpose. Without a key the app still opens, uploads and the
 * library work, and the chat says plainly what's missing, so nobody is stuck
 * here hunting for a console login.
 */
function ApiKeyStep({ status }: { status: ApiKeyStatus }) {
  const router = useRouter()
  const [leaving, setLeaving] = React.useState(false)

  function enterApp() {
    setLeaving(true)
    router.replace(APP_ROOT)
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 pt-24 pb-16">
      <TrosiveMark className="size-12" />

      <p className="mt-6 text-sm font-medium text-muted-foreground">
        Step 2 of 2
      </p>
      <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">
        Bring your own API key
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Answers come from Claude, on your own Anthropic API key. Paste it once
        and everyone in this workspace can ask away.
      </p>

      <ByokPoints className="mt-8" />

      <div className="mt-8">
        <ApiKeyForm
          status={status}
          submitLabel="Save and continue"
          autoFocus
          onSaved={enterApp}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="mt-3 h-11 w-full cursor-pointer text-sm text-muted-foreground"
        disabled={leaving}
        onClick={enterApp}
      >
        {status.source === "workspace" ? "Continue" : "I'll do it later"}
      </Button>
    </div>
  )
}

export { ApiKeyStep }
