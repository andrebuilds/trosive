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
  description:
    "Ask your documents anything and get answers that cite the exact passage behind every claim. Open source and free, with no limits: bring your own Anthropic API key.",
  /** AGPL §13: whoever runs this as a service must offer its source, so point this at your fork. */
  repoUrl: "https://github.com/andrebuilds/trosive",
  license: "AGPL-3.0",
  email: "hello@trosive.com",
  author: { name: "Andrea D'Ambrosio", url: "https://github.com/andrebuilds" },
}

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
