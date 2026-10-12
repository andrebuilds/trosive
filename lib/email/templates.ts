import { LOGO_CONTENT_ID } from "@/lib/email/logo"
import { siteConfig } from "@/lib/site-config"

export type EmailContent = {
  subject: string
  html: string
  text: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** A titled line in a short list, like the welcome email's tour. */
type Point = { title: string; text: string }

/**
 * One plain, table-free layout for every transactional email. Inline styles
 * only — Gmail and Outlook strip <style> blocks.
 *
 * Sizes follow the transactional-email guidance: 16px body copy and a tap
 * target at least 44px tall, since most of these are opened on a phone.
 *
 * The logo next to the name is an inline attachment (`cid:`) that `send` in
 * `lib/email` adds to every message, so it needs no hosted URL.
 */
function layout({
  preheader,
  heading,
  body,
  points,
  action,
  url,
  footnote,
  showUrl = true,
}: {
  /** Snippet shown after the subject in the inbox list. Keep under 90 chars. */
  preheader: string
  heading: string
  /** One string per paragraph. */
  body: string | string[]
  /** Shown between the body and the button. */
  points?: Point[]
  action: string
  url: string
  footnote: string
  /** The "paste this into your browser" fallback, for links worth retyping. */
  showUrl?: boolean
}) {
  const href = escapeHtml(url)
  const paragraphs = (Array.isArray(body) ? body : [body])
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#57534e;">${escapeHtml(paragraph)}</p>`
    )
    .join("\n      ")
  const list = points
    ? points
        .map(
          (point) =>
            `<p style="margin:0 0 12px;padding-left:12px;border-left:3px solid #e7e5e4;font-size:15px;line-height:1.6;color:#57534e;"><strong style="color:#171717;">${escapeHtml(point.title)}</strong><br />${escapeHtml(point.text)}</p>`
        )
        .join("\n      ")
    : ""

  return `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:24px;background:#f6f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#171717;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:32px;">
      <p style="margin:0 0 24px;font-size:18px;font-weight:700;line-height:32px;"><img src="cid:${LOGO_CONTENT_ID}" width="32" height="32" alt="" style="display:inline-block;width:32px;height:32px;margin-right:10px;border:0;vertical-align:middle;" /><span style="vertical-align:middle;">${escapeHtml(siteConfig.name)}</span></p>
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(heading)}</h1>
      ${paragraphs}
      ${list}
      <a href="${href}" style="display:inline-block;margin-top:8px;background:#171717;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;line-height:20px;padding:14px 24px;border-radius:8px;">${escapeHtml(action)}</a>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#78716c;">${escapeHtml(footnote)}</p>${
        showUrl
          ? `
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#a8a29e;">
        If the button doesn't work, paste this into your browser:<br />
        <span style="word-break:break-all;">${escapeHtml(url)}</span>
      </p>`
          : ""
      }
    </div>
  </body>
</html>`
}

/** How long a magic link works. Mirrors `expiresIn` on the plugin in `lib/auth.ts`. */
export const MAGIC_LINK_MINUTES = 15

/**
 * The only way in with an email address: there are no passwords. A new
 * address gets the "confirm" wording, since opening the link is what creates
 * the account, and an existing one gets a plain sign-in.
 */
export function magicLinkEmail(url: string, isNewUser: boolean): EmailContent {
  const expiry = `This link expires in ${MAGIC_LINK_MINUTES} minutes and works once.`
  const heading = isNewUser
    ? "Confirm your email address"
    : `Sign in to ${siteConfig.name}`
  const body = isNewUser
    ? `Tap the button below to confirm your address and create your ${siteConfig.name} account.`
    : `Tap the button below to sign in. No password needed.`
  const footnote = isNewUser
    ? `${expiry} If you didn't sign up, you can ignore this email.`
    : `${expiry} If you didn't ask for it, you can ignore this email: nobody can sign in without it.`

  return {
    subject: isNewUser
      ? `Confirm your email for ${siteConfig.name}`
      : `Your ${siteConfig.name} sign-in link`,
    html: layout({
      preheader: expiry,
      heading,
      body,
      action: isNewUser ? "Confirm email" : "Sign in",
      url,
      footnote,
    }),
    text: `${heading}\n\n${body}\n\n${url}\n\n${footnote}`,
  }
}

/** Sent once, when an account is created: after the first link or OAuth. */
export function welcomeEmail(name: string, url: string): EmailContent {
  const firstName = name.trim().split(/\s+/)[0]
  const heading = firstName
    ? `Welcome to ${siteConfig.name}, ${firstName}`
    : `Welcome to ${siteConfig.name}`
  const body = [
    `Your account is ready. ${siteConfig.name} answers questions about your own documents and shows you exactly where each answer comes from.`,
    "Here's how it works:",
  ]
  const points: Point[] = [
    {
      title: "Upload your documents",
      text: "PDFs, Word files, text and Markdown, up to 15 MB each.",
    },
    {
      title: "Ask in plain language",
      text: `${siteConfig.name} reads across all of them to answer, in seconds.`,
    },
    {
      title: "Check every claim",
      text: "Each answer cites the exact passage behind it, one click away.",
    },
    {
      title: "Bring your own key",
      text: `${siteConfig.name} is free with no limits. Answers run on your own Anthropic API key, so you pay Anthropic only for what you use, with nothing added on top.`,
    },
  ]
  const next =
    "Start by naming your workspace and adding your Anthropic key, then drop in your first file."
  const footnote = `${siteConfig.name} is free and open source. Questions or ideas? Just reply to this email.`

  return {
    subject: `Welcome to ${siteConfig.name}`,
    html: layout({
      preheader: "Ask your documents anything, with a source for every answer.",
      heading,
      body,
      points,
      action: `Open ${siteConfig.name}`,
      url,
      footnote: `${next} ${footnote}`,
      showUrl: false,
    }),
    text: [
      heading,
      ...body,
      ...points.map((point) => `- ${point.title}: ${point.text}`),
      next,
      url,
      footnote,
    ].join("\n\n"),
  }
}

/**
 * Sent to a workspace's owners when Anthropic rejects the workspace's key
 * mid-chat: revoked, deleted, or out of an organization it no longer belongs
 * to. Until a new one is saved, nobody in the workspace can ask anything.
 */
export function apiKeyInvalidEmail(
  workspaceName: string,
  hint: string,
  url: string
): EmailContent {
  const heading = "Your Anthropic API key stopped working"
  const body = [
    `Anthropic rejected the key ${hint} that the ${workspaceName} workspace uses for answers, so questions are paused until it's replaced.`,
    "This usually means the key was revoked or deleted in the Anthropic Console. Create a new one there and paste it into Settings, API key.",
  ]
  const footnote = `${siteConfig.name} never charges you: answers run on your own Anthropic key. Your documents and chats are untouched.`

  return {
    subject: `Action needed: your ${siteConfig.name} API key`,
    html: layout({
      preheader: "Questions are paused until you add a working key.",
      heading,
      body,
      action: "Replace the key",
      url,
      footnote,
      showUrl: false,
    }),
    text: [heading, ...body, url, footnote].join("\n\n"),
  }
}

/**
 * Sent when someone is invited to a workspace. The link opens `/invite/<id>`,
 * which signs them in (or up) with this address and asks them to accept.
 */
export function invitationEmail({
  inviterName,
  workspaceName,
  role,
  roleDescription,
  days,
  url,
}: {
  inviterName: string
  workspaceName: string
  /** "Admin" or "Member". */
  role: string
  roleDescription: string
  days: number
  url: string
}): EmailContent {
  const heading = `Join ${workspaceName} on ${siteConfig.name}`
  const body = [
    `${inviterName} invited you to the ${workspaceName} workspace as ${role === "Admin" ? "an" : "a"} ${role}. ${roleDescription}`,
    `${siteConfig.name} answers questions about your team's documents and shows exactly where each answer comes from. Answers run on the workspace's own Anthropic key, so you don't need one of your own.`,
  ]
  const footnote = `This invitation expires in ${days} days. If you weren't expecting it, you can ignore this email.`

  return {
    subject: `${inviterName} invited you to ${workspaceName} on ${siteConfig.name}`,
    html: layout({
      preheader: `Join ${workspaceName} as ${role === "Admin" ? "an" : "a"} ${role}.`,
      heading,
      body,
      action: "Accept invitation",
      url,
      footnote,
    }),
    text: [heading, ...body, url, footnote].join("\n\n"),
  }
}

/** To the person who sent the invitation, the moment it's accepted. */
export function memberJoinedEmail({
  memberName,
  memberEmail,
  workspaceName,
  role,
  url,
}: {
  memberName: string
  memberEmail: string
  workspaceName: string
  role: string
  url: string
}): EmailContent {
  const who = memberName || memberEmail
  const heading = `${who} joined ${workspaceName}`
  const body = [
    `${who}${memberName ? ` (${memberEmail})` : ""} accepted your invitation and is now ${role === "Admin" ? "an" : "a"} ${role} of ${workspaceName}.`,
    "You can change their role or remove them at any time from Settings, Members.",
  ]
  const footnote = `You're receiving this because you invited ${memberEmail}.`

  return {
    subject: `${who} joined ${workspaceName}`,
    html: layout({
      preheader: `Your invitation to ${workspaceName} was accepted.`,
      heading,
      body,
      action: "Manage members",
      url,
      footnote,
      showUrl: false,
    }),
    text: [heading, ...body, url, footnote].join("\n\n"),
  }
}

/** To the person who just joined: the confirmation that they're in. */
export function joinedWorkspaceEmail({
  workspaceName,
  inviterName,
  role,
  roleDescription,
  url,
}: {
  workspaceName: string
  inviterName: string
  role: string
  roleDescription: string
  url: string
}): EmailContent {
  const heading = `You're in: ${workspaceName}`
  const body = [
    `You joined ${workspaceName} as ${role === "Admin" ? "an" : "a"} ${role}, at ${inviterName}'s invitation. ${roleDescription}`,
    "Its documents and chats are shared with everyone in the workspace, and answers run on the workspace's Anthropic key.",
  ]
  const footnote = `Belong to more than one workspace? Switch between them from the menu under the ${siteConfig.name} logo.`

  return {
    subject: `You're in: ${workspaceName}`,
    html: layout({
      preheader: `You're now ${role === "Admin" ? "an" : "a"} ${role} of ${workspaceName}.`,
      heading,
      body,
      action: `Open ${workspaceName}`,
      url,
      footnote,
      showUrl: false,
    }),
    text: [heading, ...body, url, footnote].join("\n\n"),
  }
}

export function verificationEmail(url: string): EmailContent {
  const heading = "Confirm your email address"
  const body = `Tap the button below to finish setting up your ${siteConfig.name} account.`
  const footnote =
    "This link expires in 1 hour. If you didn't sign up, you can ignore this email."

  return {
    subject: `Confirm your email for ${siteConfig.name}`,
    html: layout({
      preheader: "This link expires in 1 hour.",
      heading,
      body,
      action: "Confirm email",
      url,
      footnote,
    }),
    text: `${heading}\n\n${body}\n\n${url}\n\n${footnote}`,
  }
}

/**
 * Sent to the address someone is moving their account *to* — opening the link
 * is what proves they hold that mailbox, and only then does the change land.
 */
export function changeEmailVerificationEmail(
  previousEmail: string,
  url: string
): EmailContent {
  const heading = "Confirm your new email address"
  const body = `Confirm this address to use it for your ${siteConfig.name} account. It replaces ${previousEmail} as your sign-in.`
  const footnote =
    "This link expires in 1 hour. If you didn't ask for this, ignore this email. The address on the account stays as it is."

  return {
    subject: `Confirm your new email for ${siteConfig.name}`,
    html: layout({
      preheader: "This link expires in 1 hour.",
      heading,
      body,
      action: "Confirm email",
      url,
      footnote,
    }),
    text: `${heading}\n\n${body}\n\n${url}\n\n${footnote}`,
  }
}

export function passwordResetEmail(url: string): EmailContent {
  const heading = "Reset your password"
  const body = `We received a request to reset the password on your ${siteConfig.name} account.`
  const footnote =
    "This link expires in 1 hour and can only be used once. If you didn't request a reset, your password is unchanged and no action is needed."

  return {
    subject: `Reset your ${siteConfig.name} password`,
    html: layout({
      preheader: "This link expires in 1 hour and can only be used once.",
      heading,
      body,
      action: "Reset password",
      url,
      footnote,
    }),
    text: `${heading}\n\n${body}\n\n${url}\n\n${footnote}`,
  }
}
