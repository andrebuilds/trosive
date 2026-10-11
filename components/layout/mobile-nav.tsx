"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, LogInIcon, MenuIcon } from "lucide-react"

import { useSession } from "@/lib/auth-client"
import { mainNav } from "@/lib/site-config"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  useAuthDialog,
  type AuthMode,
} from "@/components/auth/auth-dialog-provider"
import { TrosiveLogo } from "@/components/brand/trosive-logo"

/**
 * Reads `mainNav` itself rather than taking it as a prop: the items carry icon
 * components, which can't cross from the server header into a client one.
 */
function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const { data: session } = useSession()
  const authDialog = useAuthDialog()

  // The auth dialog can't open until the sheet has finished closing: the sheet
  // restores focus to its trigger on close, which would yank focus straight
  // back out of a dialog opened in the same tick.
  const [queuedMode, setQueuedMode] = React.useState<AuthMode | null>(null)

  function requestAuth(mode: AuthMode) {
    setQueuedMode(mode)
    setOpen(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen || !queuedMode) return
        authDialog.open(queuedMode)
        setQueuedMode(null)
      }}
    >
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className={className} />}
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="data-[side=right]:w-full data-[side=right]:sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>
            <TrosiveLogo />
            <span className="sr-only">Trosive navigation</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {mainNav.map(({ href, label, icon: Icon }) => (
            <SheetClose
              key={href}
              nativeButton={false}
              render={
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
                />
              }
            >
              {Icon && <Icon className="size-5" />}
              {label}
            </SheetClose>
          ))}
        </nav>
        {/* Signed in, the header avatar owns account actions — no duplicate. */}
        {!session && (
          <SheetFooter className="grid grid-cols-2">
            <Button variant="outline" onClick={() => requestAuth("sign-in")}>
              <LogInIcon data-icon="inline-start" />
              Sign in
            </Button>
            <Button onClick={() => requestAuth("sign-up")}>
              Try Trosive free
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
