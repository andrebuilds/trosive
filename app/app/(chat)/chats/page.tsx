import type { Metadata } from "next"

import { getWorkspaceKeyStatus } from "@/lib/api-keys"
import { listLibraryDocuments } from "@/lib/chat-store"
import { requireOrganization, requireSession } from "@/lib/session"
import { ChatHeader } from "@/components/chat/chat-header"
import { NewChatPanel } from "@/components/chat/new-chat-panel"

export const metadata: Metadata = {
  title: "New chat",
}

/** A fresh chat — `ui-design/dashboard/light/chat-main.png`. */
export default async function NewChatPage() {
  const session = await requireSession()
  const organization = await requireOrganization()
  const [documents, keyStatus] = await Promise.all([
    listLibraryDocuments(organization.id),
    getWorkspaceKeyStatus(organization.id, session.user.id),
  ])

  return (
    <>
      <ChatHeader user={session.user} title="New chat" />
      <NewChatPanel documents={documents} keyStatus={keyStatus} />
    </>
  )
}
