import type { MetadataRoute } from "next"

import { publicPages, siteUrl } from "@/lib/site-config"

/**
 * Served at `/sitemap.xml`. Only the public pages: the app itself is behind
 * sign-in, and the auth screens (`/check-email`, `/invite/…`) are reached from
 * emails, not search.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    url: `${siteUrl}${page.path === "/" ? "" : page.path}`,
  }))
}
