import { publicPages, siteConfig, siteUrl } from "@/lib/site-config"

// Nothing in it depends on the request, so it's built once.
export const dynamic = "force-static"

const repoFile = (path: string) => `${siteConfig.repoUrl}/blob/main/${path}`

/**
 * Served at `/llms.txt` (https://llmstxt.org): a short, plain description of
 * Trosive for AI assistants and the tools that read sites on their behalf,
 * with links to where the details live.
 */
export function GET() {
  const legal = publicPages
    .filter((page) => page.path !== "/")
    .map((page) => `- [${page.label}](${siteUrl}${page.path})`)

  const body = `# ${siteConfig.name}

> ${siteConfig.name} is a free, open-source (${siteConfig.license}) web app for asking questions across your own documents. Answers are written by Anthropic's Claude and cite the exact passage behind every claim. When the documents don't support an answer, ${siteConfig.name} says so instead of guessing.

- Upload PDF, Word (.docx), plain text and Markdown files to a workspace library.
- Every claim in an answer links to the passage it's based on, highlighted in a source reader.
- Search passages across the whole library or a subset of it.
- Create as many workspaces as you like, and invite teammates as admins or members.
- Bring your own key: each workspace adds its own Anthropic API key, and Anthropic bills that key. ${siteConfig.name} has no plans, no usage limits and charges nothing.
- It can be self-hosted: Next.js, React, Postgres, Prisma and Better Auth.

## Docs

- [README](${repoFile("README.md")}): features, setup, environment variables and deployment
- [Changelog](${repoFile("CHANGELOG.md")}): what changed in each release
- [Contributing](${repoFile("CONTRIBUTING.md")}): how to propose changes
- [Security policy](${repoFile("SECURITY.md")}): how to report a vulnerability

## Legal

${legal.join("\n")}

## Optional

- [Source code](${siteConfig.repoUrl})
- [License](${repoFile("LICENSE")})
- Contact: ${siteConfig.email}
`

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
