import {
  LayersIcon,
  ShieldCheckIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  href: string
  label: string
  icon?: LucideIcon
}

export const siteConfig = {
  name: "Trosive",
  /** Also the search snippet, so it stays under ~155 characters. */
  description:
    "Ask AI questions across your PDFs, Word files and notes, and get answers that cite the exact passage. Free and open source: bring your own Anthropic key.",
  /** AGPL §13: whoever runs this as a service must offer its source, so point this at your fork. */
  repoUrl: "https://github.com/andrebuilds/trosive",
  license: "AGPL-3.0",
  email: "hello@trosive.com",
  /** Privacy requests and anything about the Terms. */
  legalEmail: "legal@trosive.com",
  author: { name: "Andrea D'Ambrosio", url: "https://github.com/andrebuilds" },
  /** X (Twitter) handle, credited on link previews shared there. */
  xHandle: "@andrebuilds",
}

/**
 * The public origin, without a trailing slash, for URLs that have to be
 * absolute: `metadataBase`, the sitemap, robots.txt and llms.txt.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "")

/** Public pages worth indexing. Everything under `/app` is behind sign-in. */
export const publicPages = [
  { path: "/", label: "Home" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms of Service" },
  { path: "/cookies", label: "Cookie Policy" },
]

export type NavGroup = {
  title: string
  items: NavItem[]
}

/** Primary marketing navigation, shared by the header and the mobile drawer. */
export const mainNav: NavItem[] = [
  { href: "#product", label: "Product", icon: LayersIcon },
  { href: "#how-it-works", label: "How it works", icon: WorkflowIcon },
  { href: "#security", label: "Security", icon: ShieldCheckIcon },
]

/** Link columns in the site footer. */
export const footerNav: NavGroup[] = [
  {
    title: "Product",
    items: [
      { href: "/#product", label: "Features" },
      // No plans to price: Trosive is free and runs on your own API key.
      // Comes back with the landing's Pricing section, if that ever returns.
      // { href: "/#pricing", label: "Pricing" },
      { href: "/#security", label: "Security" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/docs", label: "Docs" },
      { href: "/docs/api", label: "API" },
      { href: "/integrations", label: "Integrations" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/dpa", label: "DPA" },
      { href: "/soc-2", label: "SOC 2" },
    ],
  },
]
