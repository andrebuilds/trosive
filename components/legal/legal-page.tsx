import Link from "next/link"

import { cn } from "@/lib/utils"

const LEGAL_PAGES = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
]

/**
 * The frame shared by Terms, Privacy and Cookies: the same eyebrow and heading
 * as the landing sections, links between the three, and long-form text styled
 * from here so the pages themselves are just headings and paragraphs.
 */
function LegalPage({
  title,
  updated,
  current,
  children,
}: {
  title: string
  /** When the text last changed in substance, e.g. "20 October 2026". */
  updated: string
  /** This page's own path, so it isn't linked to itself. */
  current: string
  children: React.ReactNode
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="flex flex-col gap-4 border-b pb-8">
        <p className="font-mono text-xs font-bold tracking-[0.18em] text-brand uppercase">
          Legal
        </p>
        <h1 className="text-3xl leading-[1.15] font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">Last updated {updated}</p>

        <nav
          aria-label="Legal pages"
          className="flex gap-4 text-sm text-muted-foreground"
        >
          {LEGAL_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              aria-current={page.href === current ? "page" : undefined}
              className={cn(
                "underline-offset-4 hover:text-foreground hover:underline",
                page.href === current && "font-medium text-foreground"
              )}
            >
              {page.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="flex flex-col gap-10 pt-10 text-[0.9375rem] leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </article>
  )
}

/** One section: a heading and the prose under it. The id makes it linkable. */
function LegalSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export { LegalPage, LegalSection }
