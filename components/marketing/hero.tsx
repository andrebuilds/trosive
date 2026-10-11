// import Link from "next/link"
import { ArrowRightIcon, MessageSquareQuoteIcon } from "lucide-react"

import { siteConfig } from "@/lib/site-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AuthDialogTrigger } from "@/components/auth/auth-dialog-trigger"
import { GitHubIcon } from "@/components/auth/provider-icons"
// import { HeroPreview } from "@/components/marketing/hero-preview"
// import { TrustedBy } from "@/components/marketing/trusted-by"

/** Keeps the icon-side padding symmetric, since `Button` tightens it by default. */
const CTA_CLASSES =
  "h-12 w-full gap-2.5 px-6 text-base has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-3 sm:w-auto"

function Hero() {
  return (
    // Fills the space between header and footer and centers in it, with only
    // a small padding, so the landing fits one screen without scrolling.
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-5 text-center sm:gap-7">
        <Badge
          variant="outline"
          className="h-8 gap-0 p-0 text-sm font-normal text-muted-foreground"
        >
          <span className="flex h-full items-center bg-foreground px-2.5 text-xs font-semibold tracking-wider text-background uppercase">
            Open source
          </span>
          <span className="flex items-center gap-2 px-3">
            <span aria-hidden className="size-1.5 animate-pulse bg-brand" />
            {/* The full line runs ~45 characters, wider than a phone. */}
            <span className="sm:hidden">Every answer, cited</span>
            <span className="hidden sm:inline">
              Every answer, traced to the line it came from
            </span>
          </span>
        </Badge>

        {/* One line per sentence from `sm` up. Geist Mono runs ~0.6em a
            character, so the size tracks the viewport instead of a fixed step
            that would wrap the longer line. On phones each sentence takes two
            balanced lines instead. */}
        <h1 className="text-[1.75rem] leading-[1.1] font-bold tracking-tight text-balance sm:text-[clamp(2rem,5.4vw,4rem)] sm:leading-[1.05] sm:whitespace-nowrap">
          <span className="block">Ask your documents anything.</span>
          <span className="block">
            Get answers{" "}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[0.06em] h-[0.24em] bg-brand/25"
              />
              <span className="relative">with receipts.</span>
            </span>
          </span>
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
          Drop in your contracts, reports and research. Trosive answers in
          seconds and pins every claim to the exact passage behind it.
          {/* Phones stop at the core promise; the rest would double the block. */}
          <span className="hidden sm:inline">
            {" "}
            One click and you&apos;re reading the source. No skimming, no
            guesswork, no made-up facts.
          </span>
        </p>

        <div className="mt-1 flex w-full flex-col gap-3 sm:mt-0 sm:w-auto sm:flex-row">
          <AuthDialogTrigger mode="sign-up" className={CTA_CLASSES}>
            <span
              data-icon="inline-start"
              className="flex size-7 items-center justify-center bg-primary-foreground/15"
            >
              <MessageSquareQuoteIcon className="size-4" />
            </span>
            Ask your first question
            <ArrowRightIcon
              data-icon="inline-end"
              className="transition-transform group-hover/button:translate-x-1"
            />
          </AuthDialogTrigger>
          <Button
            variant="outline"
            className={CTA_CLASSES}
            render={
              <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" />
            }
            nativeButton={false}
          >
            <span
              data-icon="inline-start"
              className="flex size-7 items-center justify-center bg-foreground text-background transition-transform group-hover/button:scale-110"
            >
              <GitHubIcon className="size-4" />
            </span>
            Star on GitHub
          </Button>
          {/* Points at the "How it works" section, off for now. Needs `Link`
              and `PlayIcon` imported again:
          <Button
            variant="outline"
            className={CTA_CLASSES}
            render={<Link href="#how-it-works" />}
            nativeButton={false}
          >
            <span
              data-icon="inline-start"
              className="flex size-7 items-center justify-center bg-foreground text-background transition-transform group-hover/button:scale-110"
            >
              <PlayIcon className="size-3.5 fill-current" />
            </span>
            See it in action
          </Button> */}
        </div>
      </div>

      {/* The product mock and the logo strip, off while the landing is just
          the hero. Uncomment them along with their imports to bring them back.
      <HeroPreview className="mt-16 lg:mt-20" />

      <TrustedBy className="mt-20 lg:mt-28" /> */}
    </section>
  )
}

export { Hero }
