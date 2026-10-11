import Link from "next/link"
import { MailIcon, StarIcon } from "lucide-react"

import { siteConfig } from "@/lib/site-config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GitHubIcon } from "@/components/auth/provider-icons"
import { TrosiveMark } from "@/components/brand/trosive-logo"
import { ModeToggle } from "@/components/theme/mode-toggle"

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
]

/**
 * The repo's star count, refreshed hourly. Null while the repo is private or
 * GitHub is unreachable, and the button then shows the icon alone.
 */
async function getStarCount(): Promise<number | null> {
  const repo = new URL(siteConfig.repoUrl).pathname
  try {
    const res = await fetch(`https://api.github.com/repos${repo}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const { stargazers_count } = (await res.json()) as {
      stargazers_count?: number
    }
    return stargazers_count ?? null
  } catch {
    return null
  }
}

async function SiteFooter() {
  const stars = await getStarCount()

  return (
    <footer className="border-t bg-background">
      {/* Two centered rows on phones, one split row from `sm` up. */}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:gap-2 sm:px-6 sm:py-2.5">
        <p className="flex items-center gap-2">
          <TrosiveMark className="size-6 shrink-0" />
          <span className="flex flex-wrap items-center gap-x-1.5 max-sm:justify-center max-sm:text-center">
            {siteConfig.name} is free and open source, crafted by
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              <Avatar className="size-5 border">
                <AvatarImage src={`${siteConfig.author.url}.png?size=40`} />
                <AvatarFallback className="text-[0.5rem]">AD</AvatarFallback>
              </Avatar>
              {siteConfig.author.name}
            </a>
          </span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1">
          <nav aria-label="Legal" className="flex items-center gap-3 pr-1.5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />

          <Button
            variant="ghost"
            className="h-8 gap-1.5 px-2.5"
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

          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            render={
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label={`Email ${siteConfig.email}`}
              />
            }
            nativeButton={false}
          >
            <MailIcon />
          </Button>

          <Separator
            orientation="vertical"
            className="mx-1.5 data-vertical:h-4 data-vertical:self-auto"
          />

          <ModeToggle variant="ghost" className="size-8" />
        </div>
      </div>
    </footer>
  )
}

export { SiteFooter }

/*
 * The previous footer: logo, tagline, four link columns from `footerNav`, then
 * the copyright row. To bring it back, swap it in for `SiteFooter` above and
 * restore these imports:
 *
 *   import { footerNav } from "@/lib/site-config"
 *   import { TrosiveLogo } from "@/components/brand/trosive-logo"
 *
function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-8 pt-14 pb-12">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Trosive home" className="w-fit">
              <TrosiveLogo size="sm" />
            </Link>
            <p className="max-w-72 text-sm leading-relaxed text-muted-foreground">
              Chat with your documents — with a citation for every answer.
            </p>
          </div>

          <nav className="grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title} className="flex flex-col gap-4">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {group.title}
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm transition-colors hover:text-brand"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.author.name}. Open source
            under{" "}
            <a
              href={siteConfig.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-brand"
            >
              {siteConfig.license}
            </a>
            .
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Built for people who have to be right.
          </p>
        </div>
      </div>
    </footer>
  )
}
*/
