/**
 * Onboarding chrome: none. No header, sidebar or search, since there is no
 * workspace to navigate or search yet; each step carries its own mark.
 * `/app`'s layout has already required a session.
 *
 * Two steps: name the workspace, then bring its Anthropic key. Each page
 * guards itself, because the second step needs the workspace the first one
 * refuses to show once it exists.
 */
export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <main className="flex min-h-svh flex-col">{children}</main>
}
