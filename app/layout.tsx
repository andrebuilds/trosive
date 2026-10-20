import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { DEFAULT_TITLE } from "@/lib/seo"
import { siteConfig, siteUrl } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme/theme-provider"

/**
 * The whole UI is set in Geist Mono. next/font registers it under a generated
 * family name, exposed as `--font-geist-mono`; `globals.css` points the sans,
 * serif and mono tokens at it.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

/**
 * Defaults for every page. Public pages add their canonical URL and link
 * preview through `pageMetadata` (`lib/seo.ts`); `/app` and the auth screens
 * opt out of indexing in their layouts.
 */
export const metadata: Metadata = {
  // Resolves relative URLs: canonicals, `og:url` and the preview image.
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [siteConfig.author],
  creator: siteConfig.author.name,
  category: "productivity",
  // Fallback link preview for routes that don't call `pageMetadata`.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    title: DEFAULT_TITLE,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.xHandle,
    creator: siteConfig.xHandle,
  },
}

/** Tints the mobile browser bar to match the page in either theme. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", geistMono.variable)}
    >
      <body className="min-h-svh bg-background text-foreground">
        {/* One toast manager for the whole app — `toast` from
            `components/ui/toast` posts to this viewport from anywhere. */}
        <ThemeProvider>
          <Toaster>{children}</Toaster>
        </ThemeProvider>
      </body>
    </html>
  )
}
