import { siteConfig } from "@/lib/site-config"

/**
 * The repo's star count, refreshed hourly. Null while the repo is private or
 * GitHub is unreachable, and the button then shows the icon alone.
 */
async function getStarCount(): Promise<number | null> {
  const repo = new URL(siteConfig.repoUrl).pathname
  try {
    const res = await fetch(`https://api.github.com/repos${repo}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const { stargazers_count } = (await res.json()) as {
      stargazers_count?: number
    }
    return stargazers_count ?? null
  } catch {
    return null
  }
}

export { getStarCount }
