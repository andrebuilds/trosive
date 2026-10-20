import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site-config"

/**
 * Served at `/robots.txt`. Crawlers are welcome on the public pages; the rest
 * is either behind sign-in or a one-off screen an email link lands on, and
 * would only ever be indexed as a redirect or an error.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app/",
        "/api/",
        "/invite/",
        "/check-email",
        "/reset-password",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
