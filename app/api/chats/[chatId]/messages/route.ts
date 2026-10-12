import { NextResponse } from "next/server"

import { createAnthropicClient } from "@/lib/anthropic"
import { markWorkspaceKeyInvalid, resolveAnthropicKey } from "@/lib/api-keys"
import { requireApiContext } from "@/lib/api-session"
import { streamAnswer } from "@/lib/answer"
import { NO_API_KEY_CODE } from "@/lib/byok"
import type { ChatSource } from "@/lib/chat"
import {
  addMessage,
  getChat,
  getChatDocuments,
  getChatHistory,
  recordQuestion,
} from "@/lib/chat-store"

/** Reading a long brief and writing the briefing takes minutes, not seconds. */
export const maxDuration = 300

/**
 * Answers the chat's outstanding turn and streams it back.
 *
 * With a `question` it records that question first; without one it answers the
 * turn already waiting — the seeded brief analysis on a new chat, or a
 * follow-up whose answer was interrupted by a reload.
 *
 * The wire format is newline-delimited JSON, one event per line. Plain
 * `text/event-stream` would work too, but NDJSON needs no framing rules and the
 * client can parse it with a split on "\n".
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const guard = await requireApiContext()
  if (!guard.ok) return guard.response

  // Bring your own key: no key, no answer. Checked before the question is
  // stored, so a refused question doesn't sit in the thread unanswered. The
  // code is what the composer keys its "add your key" prompt on.
  const key = await resolveAnthropicKey(guard.context.organizationId)

  if (!key) {
    return NextResponse.json(
      {
        code: NO_API_KEY_CODE,
        error:
          "This workspace needs a working Anthropic API key before it can answer. Add one in Settings, API key.",
      },
      { status: 409 }
    )
  }

  const { chatId } = await params
  const chat = await getChat(chatId, guard.context.organizationId)

  if (!chat) {
    return NextResponse.json({ error: "Chat not found." }, { status: 404 })
  }

  let body: { question?: unknown; documentIds?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    // No body is the normal case for "answer the turn already waiting".
  }

  const question =
    typeof body.question === "string" ? body.question.trim() : undefined

  if (question) {
    await addMessage({ chatId, role: "USER", content: question })
  } else if (!chat.pendingAnswer) {
    return NextResponse.json(
      { error: "That chat has nothing waiting on an answer." },
      { status: 409 }
    )
  }

  const [attached, history] = await Promise.all([
    getChatDocuments(chatId),
    getChatHistory(chatId),
  ])

  if (attached.length === 0) {
    return NextResponse.json(
      { error: "That chat has no documents to read." },
      { status: 409 }
    )
  }

  // A scope narrows which of the chat's documents this answer may draw on.
  // Filtering preserves the chat's own order, so citation numbering still runs
  // top to bottom, and `document_index` keeps lining up with what we sent.
  const scope = Array.isArray(body.documentIds)
    ? body.documentIds.filter((id): id is string => typeof id === "string")
    : null

  const documents =
    scope === null
      ? attached
      : attached.filter((document) => scope.includes(document.id))

  if (documents.length === 0) {
    return NextResponse.json(
      { error: "None of those documents belong to this chat." },
      { status: 400 }
    )
  }

  // Counted here, past every reason this request could still be turned away.
  // Nothing is charged against it: the answer is billed to the workspace's own
  // Anthropic key. It feeds the home page, Usage and the admin console.
  if (question) {
    await recordQuestion({
      organizationId: guard.context.organizationId,
      userId: guard.context.userId,
      chatId,
    })
  }

  const client = createAnthropicClient(key.apiKey)
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))

      let answer = ""

      try {
        for await (const event of streamAnswer(client, documents, history)) {
          if (event.type === "text") {
            answer += event.value
            send(event)
            continue
          }

          if (event.type === "error") {
            send(event)

            // Anthropic refused the workspace's own key: mark it so the app
            // stops trying and shows the banner, and tell the owners. The
            // instance key is the operator's problem, not the workspace's.
            if (event.invalidKey && key.source === "workspace") {
              await markWorkspaceKeyInvalid(
                guard.context.organizationId,
                "Anthropic rejected this key. It may have been revoked or deleted."
              )
            }

            return
          }

          if (!answer.trim()) {
            send({ type: "error", value: "Claude returned an empty answer." })
            return
          }

          const saved = await addMessage({
            chatId,
            role: "ASSISTANT",
            content: answer,
            sources: event.sources as ChatSource[],
          })

          // The id goes back so the browser's optimistic copy of this answer
          // can be rated — feedback needs the real row, not a placeholder key.
          send({ type: "done", sources: event.sources, messageId: saved.id })
        }
      } catch (error) {
        console.error("[chat] streaming failed", error)
        send({ type: "error", value: "The answer stopped unexpectedly." })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
