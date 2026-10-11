import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { siteConfig } from "@/lib/site-config"
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

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name}: Ask your documents anything`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [siteConfig.author],
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
