import Link from "next/link"

import { pageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site-config"
import { LegalPage, LegalSection } from "@/components/legal/legal-page"

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: `The cookies ${siteConfig.name} sets, why each one is needed, and why there's no cookie banner: no analytics, no ads, no tracking.`,
  path: "/cookies",
})

/**
 * Everything the app actually stores in the browser. Keep this in step with
 * the code: Better Auth's session cookies (`lib/auth.ts`), the sidebar's
 * `sidebar_state` (`components/ui/sidebar.tsx`) and next-themes' `theme`.
 */
const STORED = [
  {
    name: "better-auth.session_token",
    purpose: "Keeps you signed in.",
    duration: "7 days after you last use the app",
  },
  {
    name: "better-auth.session_data",
    purpose:
      "A short-lived copy of your session, so pages load without checking it every time.",
    duration: "5 minutes",
  },
  {
    name: "sidebar_state",
    purpose: "Remembers whether you left the app's sidebar open or closed.",
    duration: "7 days",
  },
  {
    name: "theme",
    purpose:
      "Remembers whether you picked the light or dark theme. Kept in your browser's local storage, not a cookie.",
    duration: "Until you clear it",
  },
]

/** `/cookies`. */
export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="20 October 2026" current="/cookies">
      <LegalSection id="summary" title="Only what the app needs">
        <p>
          {siteConfig.name} uses only the cookies it needs to work: one to keep
          you signed in, and a few that remember your choices. There are no
          analytics, advertising or tracking cookies, and nothing is shared
          with third parties for marketing.
        </p>
        <p>
          Because all of them are strictly necessary, the law doesn&apos;t
          require your consent for them, which is why there&apos;s no cookie
          banner.
        </p>
      </LegalSection>

      <LegalSection id="list" title="What we store">
        <div className="mt-1 overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-4 py-2.5 font-semibold">Purpose</th>
                <th className="px-4 py-2.5 font-semibold">Lasts</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {STORED.map((item) => (
                <tr key={item.name} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-foreground">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">{item.purpose}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          Over HTTPS, the two session cookies carry a{" "}
          <code className="font-mono text-xs">__Secure-</code> prefix. Signing
          in with Google or GitHub briefly sets a cookie that ties their reply
          to your sign-in attempt.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="Third parties">
        <p>
          The site footer shows a profile picture hosted by GitHub, so your
          browser contacts GitHub to load it. If you choose to sign in with
          Google or GitHub, you visit their sites, which set their own cookies
          under their own policies.
        </p>
      </LegalSection>

      <LegalSection id="control" title="Your choices">
        <p>
          You can delete or block cookies in your browser&apos;s settings. If
          you block the session cookie, you won&apos;t be able to sign in.
        </p>
        <p>
          More about your data is in the{" "}
          <Link href="/privacy">Privacy Policy</Link>. Questions:{" "}
          <a href={`mailto:${siteConfig.legalEmail}`}>
            {siteConfig.legalEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
