import { getAppSettings } from "@/lib/app-settings-store"
import { pageMetadata } from "@/lib/seo"
import { siteConfig } from "@/lib/site-config"
import { LegalPage, LegalSection } from "@/components/legal/legal-page"

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles your account, documents and chats: what we collect, who processes it, how long we keep it and your GDPR rights.`,
  path: "/privacy",
})

const PROVIDERS = [
  {
    name: "Railway",
    role: "Runs the app",
    where: "EU",
    href: "https://railway.com/legal/privacy",
  },
  {
    name: "Neon",
    role: "Database: accounts, workspaces, documents and chats",
    where: "EU",
    href: "https://neon.com/privacy-policy",
  },
  {
    name: "Resend",
    role: "Sends sign-in links, invitations and notices",
    where: "EU (Ireland)",
    href: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "Anthropic",
    role: "Claude, which writes the answers",
    where: "United States",
    href: "https://www.anthropic.com/legal/privacy",
  },
]

/**
 * `/privacy`. The retention line reads the live setting from the admin
 * console, so the page can't promise a window the purge doesn't keep.
 */
export default async function PrivacyPage() {
  const { chatRetentionMonths } = await getAppSettings()
  const email = siteConfig.legalEmail

  return (
    <LegalPage title="Privacy Policy" updated="20 October 2026" current="/privacy">
      <LegalSection id="who" title="Who we are">
        <p>
          {siteConfig.name} at trosive.com is run by{" "}
          {siteConfig.author.name}, an individual based in Italy
          (&quot;we&quot;, &quot;us&quot;), who is the data controller for
          the personal data described here. You can reach us at{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </p>
        <p>
          {siteConfig.name} is also open source software that anyone can run
          on their own servers. This policy covers trosive.com only. If you use
          a copy run by someone else, whoever runs it is responsible for your
          data there.
        </p>
      </LegalSection>

      <LegalSection id="short-version" title="The short version">
        <ul>
          <li>
            We collect what it takes to run your account and answer your
            questions, and nothing for advertising. There are no analytics or
            tracking tools on the site.
          </li>
          <li>
            To answer a question, its text and the documents in the chat are
            sent to Anthropic, using your workspace&apos;s own API key.
          </li>
          <li>We never sell your data or use it to train AI models.</li>
          <li>
            You can delete your documents, chats, workspaces and account
            yourself, at any time, from the app.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="what-we-collect" title="What we collect">
        <ul>
          <li>
            <strong>Your account:</strong> your name, email address and profile
            picture, if you add one. If you set a password, we store only a
            hash of it. If you sign in with Google or GitHub, we receive your
            name, email address and profile picture from them.
          </li>
          <li>
            <strong>Workspaces:</strong> their names, who is a member and in
            what role, and invitations, including the email address someone
            was invited at and who invited them.
          </li>
          <li>
            <strong>Your content:</strong> the documents you upload (the
            original file and the text taken from it), and your chats: the
            questions, the answers, the passages they cite and any feedback you
            give on an answer.
          </li>
          <li>
            <strong>Your workspace&apos;s Anthropic API key:</strong> stored
            encrypted. It&apos;s never shown again after you save it, only a
            short hint of its first and last characters.
          </li>
          <li>
            <strong>Usage:</strong> a record that a question was asked, by whom,
            in which workspace and when, which feeds the Usage page. It
            doesn&apos;t contain the question itself.
          </li>
          <li>
            <strong>Security data:</strong> the IP address and browser of each
            signed-in session, short-lived counters used to limit repeated
            sign-in attempts, and a log of actions taken in the admin console.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="why" title="Why we use it">
        <ul>
          <li>
            <strong>To provide the service</strong>, which is the contract
            between us (Article 6(1)(b) GDPR): signing you in, running your
            workspaces, answering your questions, and sending the emails the
            service depends on, such as sign-in links, invitations and notices
            about your API key.
          </li>
          <li>
            <strong>To keep it secure</strong>, a legitimate interest (Article
            6(1)(f) GDPR): spotting suspicious sign-ins, limiting abuse and
            keeping a record of administrative actions.
          </li>
          <li>
            <strong>To meet legal obligations</strong> (Article 6(1)(c) GDPR),
            when the law requires us to keep or hand over data.
          </li>
        </ul>
        <p>
          We don&apos;t send marketing emails, show ads, sell data, or use your
          content to train AI models.
        </p>
      </LegalSection>

      <LegalSection id="anthropic" title="Your documents and Anthropic">
        <p>
          Answers are written by Claude, a model made by Anthropic. When you
          ask a question, {siteConfig.name} sends Anthropic the question, the
          earlier messages in that chat and the content of the documents
          attached to it. Smaller jobs, such as naming a chat or summarizing a
          document, send Anthropic that chat or document too.
        </p>
        <p>
          These requests are made with the API key saved for your workspace,
          so they&apos;re covered by the agreement between that key&apos;s
          owner and Anthropic, and processed by Anthropic in the United States.
          Anthropic doesn&apos;t train its models on API data by default. How
          long it keeps requests is set out in{" "}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Anthropic&apos;s privacy policy
          </a>
          .
        </p>
        <p>
          Only upload documents you&apos;re allowed to share with Anthropic.
        </p>
      </LegalSection>

      <LegalSection id="who-sees-it" title="Who can see your data">
        <p>
          A workspace is shared: everyone in it can see its documents and
          chats, and use its API key. Its owner and admins decide who is in it.
        </p>
        <p>
          We can access the database to operate the service, and look at
          your data only to keep the service running, fix a problem
          you&apos;ve reported, deal with abuse, or when the law requires it.
        </p>
      </LegalSection>

      <LegalSection id="providers" title="Service providers">
        <p>
          These companies process data on our behalf, only to provide their
          part of the service:
        </p>
        <ul>
          {PROVIDERS.map((provider) => (
            <li key={provider.name}>
              <a href={provider.href} target="_blank" rel="noreferrer">
                {provider.name}
              </a>
              : {provider.role}. Data stored in: {provider.where}.
            </li>
          ))}
        </ul>
        <p>
          If you sign in with Google or GitHub, they handle that sign-in under
          their own privacy policies. The site footer also shows a profile
          picture hosted by GitHub, so your browser contacts GitHub to load it.
        </p>
        <p>
          Some of these providers are US companies, and Anthropic processes
          data in the United States. Where personal data leaves the European
          Economic Area, the transfer relies on the EU-US Data Privacy
          Framework or on the European Commission&apos;s Standard Contractual
          Clauses.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <ul>
          <li>
            <strong>Chats</strong>{" "}
            {chatRetentionMonths === null
              ? "are kept until you delete them."
              : `are deleted automatically ${chatRetentionMonths} months after their last message, or earlier if you delete them.`}
          </li>
          <li>
            <strong>Documents</strong> are kept until someone allowed to
            deletes them, or the workspace is deleted.
          </li>
          <li>
            <strong>Your account</strong> is kept until you delete it. Deleting
            it removes your profile, your sessions and every workspace where
            you are the only member, straight away. In workspaces you share,
            the documents and chats you added stay with the other members, as
            part of their shared work. Ask a workspace admin, or us, if you
            want them removed.
          </li>
          <li>
            <strong>Sessions</strong> expire 7 days after you last used them.
          </li>
          <li>
            <strong>Usage records</strong> are kept as long as their workspace
            exists.
          </li>
          <li>
            Deleted data can stay in database backups for up to 30 days before
            it&apos;s gone for good.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>
          Under the GDPR you can ask to access, correct, delete or receive a
          copy of your personal data, and to restrict or object to how
          we use it. You can change your name and email address, and delete
          your account, in the app&apos;s settings. For anything else, write
          to <a href={`mailto:${email}`}>{email}</a>. We&apos;ll reply within
          one month.
        </p>
        <p>
          You can also complain to a data protection authority: in Italy, the{" "}
          <a
            href="https://www.garanteprivacy.it"
            target="_blank"
            rel="noreferrer"
          >
            Garante per la protezione dei dati personali
          </a>
          , or the one where you live or work.
        </p>
      </LegalSection>

      <LegalSection id="security" title="Security">
        <p>
          Everything travels over HTTPS. Passwords are stored only as hashes,
          and Anthropic API keys are encrypted with AES-256-GCM. If you find a
          security problem, please report it privately to{" "}
          <a href="mailto:security@trosive.com">security@trosive.com</a>.
        </p>
      </LegalSection>

      <LegalSection id="age" title="Age">
        <p>
          {siteConfig.name} is not meant for anyone under 16, and we don&apos;t
          knowingly collect their data.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this policy">
        <p>
          When this policy changes, the date at the top changes with it. If a
          change affects how your data is used, we&apos;ll tell you by email
          before it applies.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
