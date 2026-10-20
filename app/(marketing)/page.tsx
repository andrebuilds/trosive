import { pageMetadata } from "@/lib/seo"
import { redirectIfSignedIn } from "@/lib/session"
import { siteConfig, siteUrl } from "@/lib/site-config"
// import { EverythingInOneWorkspace } from "@/components/marketing/everything-in-one-workspace"
// import { Faqs } from "@/components/marketing/faqs"
// import { FooterCta } from "@/components/marketing/footer-cta"
import { Hero } from "@/components/marketing/hero"
// import { HowItWorks } from "@/components/marketing/how-it-works"
// import { Pricing } from "@/components/marketing/pricing"
// import { Privacy } from "@/components/marketing/privacy"
// import { Stats } from "@/components/marketing/stats"
// import { Testimonials } from "@/components/marketing/testimonials"

export const metadata = pageMetadata({ path: "/" })

/**
 * Structured data for search engines (schema.org): what Trosive is, that it's
 * free and who makes it. Eligible for the software rich result on Google.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  license: "https://www.gnu.org/licenses/agpl-3.0.html",
  isAccessibleForFree: true,
  author: {
    "@type": "Person",
    name: siteConfig.author.name,
    url: siteConfig.author.url,
    // Ties the GitHub and X profiles to the same person.
    sameAs: [
      siteConfig.author.url,
      `https://x.com/${siteConfig.xHandle.slice(1)}`,
    ],
  },
}

export default async function Page() {
  // The landing page is for visitors — anyone with a session belongs in /app.
  await redirectIfSignedIn()

  // Just the hero for now. The other sections are commented out, not deleted,
  // so any of them can come back by uncommenting its import and its line.
  return (
    <>
      <script
        type="application/ld+json"
        // Static data from site-config; `<` is escaped so the JSON can never
        // close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      {/* <HowItWorks />
      <EverythingInOneWorkspace />
      <Privacy />
      <Stats />
      <Testimonials />
      <Pricing />
      <Faqs />
      <FooterCta /> */}
    </>
  )
}
