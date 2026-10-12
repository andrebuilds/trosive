import { cookies } from "next/headers"

import { getWorkspaceKeyStatus } from "@/lib/api-keys"
import { listChats } from "@/lib/chat-store"
import {
  getWorkspaces,
  requireOrganization,
  requireSession,
} from "@/lib/session"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/chat/chat-sidebar"

/** Written by `SidebarProvider`; read here so the first paint matches. */
const SIDEBAR_COOKIE_NAME = "sidebar_state"

/**
 * Chat has its own chrome: the sidebar carries chat history instead of the
 * product nav, so it gets its own route group rather than living under
 * `(workspace)`. It still needs a workspace — `requireOrganization` bounces
 * anyone without one to onboarding.
 *
 * The inset is pinned to the viewport so the thread scrolls under a fixed
 * header and composer instead of growing the page. Each page renders its own
 * header, because only the page knows which chat it's showing.
 */
export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireSession()
  const organization = await requireOrganization()
  const [chats, cookieStore, workspaces, keyStatus] = await Promise.all([
    listChats(organization.id),
    cookies(),
    getWorkspaces(),
    getWorkspaceKeyStatus(organization.id, session.user.id),
  ])

  return (
    <SidebarProvider
      defaultOpen={cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false"}
    >
      <ChatSidebar
        user={session.user}
        workspaces={workspaces}
        activeWorkspaceId={organization.id}
        role={organization.role}
        chats={chats}
        keyStatus={keyStatus}
      />

      <SidebarInset className="h-svh min-w-0 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
