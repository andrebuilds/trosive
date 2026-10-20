import type { Metadata } from "next"

import { siteConfig } from "@/lib/site-config"

/** The landing page's title, and what every other title falls back to. */
export const DEFAULT_TITLE = `${siteConfig.name}: Ask your documents anything`

/**
 * Metadata for a public, indexable page: its canonical URL plus the Open Graph
 * and X cards that link previews are built from.
 *
 * Next replaces a parent's `openGraph` and `twitter` objects rather than
 * merging them, so each page spells them out in full here. The preview image
 * isn't set: `app/opengraph-image.png` is attached to every route by the file
 * convention.
 */
export function pageMetadata({
  title,
  description = siteConfig.description,
  path,
}: {
  /** Omit for the landing page, which uses `DEFAULT_TITLE` as is. */
  title?: string
  description?: string
  /** Relative to `metadataBase`, e.g. "/privacy". */
  path: string
}): Metadata {
  const fullTitle = title ? `${title} · ${siteConfig.name}` : DEFAULT_TITLE

  return {
    title: title ?? { absolute: DEFAULT_TITLE },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_US",
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.xHandle,
      creator: siteConfig.xHandle,
      title: fullTitle,
      description,
    },
  }
}
