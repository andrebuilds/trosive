import Anthropic from "@anthropic-ai/sdk"

/**
 * Anthropic (Claude) configuration for chat answers.
 *
 * Server-only — this pulls the SDK in, so never import it from a client
 * component (same rule as `lib/auth.ts`). Client-side copy and limits live in
 * `lib/chat.ts`.
 *
 * Bring your own key: every request runs on the workspace's own Anthropic key,
 * resolved per request by `lib/api-keys.ts`. `ANTHROPIC_API_KEY` in `.env` is
 * only an optional fallback for self-hosting — see `.env.example`.
 */

/** Answers questions over a chat's documents. */
export const ANTHROPIC_MODEL = "claude-opus-5"

/** Side work that doesn't need the big model — naming a chat, summaries. */
export const ANTHROPIC_UTILITY_MODEL = "claude-haiku-4-5"

/**
 * A ceiling, not a spend: unused headroom costs nothing. It has to cover
 * thinking *and* the answer, because Claude Opus 5 counts both against it and
 * thinking is on by default — size it too tightly and answers truncate
 * mid-sentence.
 */
export const ANTHROPIC_MAX_TOKENS = 64_000

/**
 * Adaptive thinking: Claude decides how much to reason per question. This is
 * already the default on Claude Opus 5, but it's stated so the intent survives
 * a model change. `budget_tokens` is rejected by this model — don't reintroduce
 * it; depth is controlled by `effort` below.
 *
 * `display` is left at its default (`"omitted"`), so thinking blocks come back
 * with empty text. Set it to `"summarized"` only if reasoning is ever shown to
 * the user.
 */
export const ANTHROPIC_THINKING = { type: "adaptive" } as const

/**
 * `high` is the right rung for document Q&A: intelligence-sensitive, but not
 * the agentic/coding work that wants `xhigh`. Note this is nested under
 * `output_config` — it is not a top-level request parameter.
 */
export const ANTHROPIC_OUTPUT_CONFIG = { effort: "high" } as const

/**
 * Claude Opus 5's safety classifiers can decline a request outright, and benign
 * work occasionally trips them. `"default"` lets the API re-run the declined
 * request on Anthropic's recommended substitute, routed by refusal category, so
 * we never have to maintain a model list ourselves.
 */
export const ANTHROPIC_FALLBACK_BETA = "server-side-fallback-2026-07-01"
export const ANTHROPIC_FALLBACKS = "default"

/**
 * The whole product promise in one prompt: only the attached documents count as
 * truth, and the reader is a developer who has to build from them.
 *
 * It deliberately says nothing about writing `[n]` markers. Citations are
 * structural — the documents go up with `citations: { enabled: true }` and
 * Claude returns them attached to the text they support, so the markers are
 * numbered from real references instead of ones the model recalled.
 *
 * Also deliberately free of "double-check your work" instructions — Claude
 * Opus 5 verifies unprompted, and repeating it just burns tokens.
 */
export const ANTHROPIC_SYSTEM_PROMPT = `You are Trosive. You answer strictly from the documents attached to this chat, for a developer who has to act on them.

Rules:
- Use only the attached documents. Never answer from prior knowledge, and never fill a gap with a plausible guess.
- Ground every factual claim in the documents. A claim the documents don't support doesn't belong in the answer.
- When the documents disagree, say so and give both sides rather than silently picking one.
- When the documents don't answer the question, say plainly that they don't and name what would settle it. Do not apologise at length.
- Reproduce exact wording for anything the reader will rely on verbatim — deadlines, amounts, defined terms, acceptance criteria.
- Lead with the answer, then the supporting detail. Keep it to the length the question needs.
- Write for someone who will build from this. Prefer concrete specifics over restating the document's own summary language.

Formatting — the answer is rendered as Markdown, so write real Markdown and never leave raw syntax for the reader to decode:
- \`##\` for section headings, \`###\` for anything nested under one.
- Short paragraphs and bullet lists. Never pack a bolded label and its explanation into the same line — put the label on its own line and the explanation underneath.
- Bold for emphasis, backticks for literal values.
- Never wrap wording taken from a document in quotation marks. Write it inline as ordinary prose — the citation marker already tells the reader it came from the source, so the quotes are noise.
- A table is fine for a set of short label/value facts, but it must have a real header row. Never emit a table with an empty header.
- No horizontal rules.
- Every web address must be a clickable Markdown link — \`[label](https://example.com)\` — with the full \`https://\` scheme, every time, without exception. Never write a bare domain like example.com, and never put an address in backticks: inline code is not clickable. This applies even when the document itself wrote the address bare, and even mid-sentence or inside a table cell or list item.`

/**
 * The opening turn on a new chat, stored hidden and sent as the first user
 * message. This is the "saves the developer hours" pass: what the client wants,
 * what's actually painful, what they asked, and what's missing.
 */
export const ANTHROPIC_BRIEF_ANALYSIS_PROMPT = `Read the attached document end to end, then brief the developer who has to build from it.

Write these sections in this order, each under a \`##\` heading, skipping any the document genuinely has nothing for:

## Summary
What is being asked for, in a few sentences.

## Pain points
The problems the client actually wants solved, including ones they only describe indirectly. Give each one its own \`###\` heading of a few words, then explain it in a paragraph underneath, pointing to what in the document indicates it. Never put the title and the explanation on the same line.

## Their questions, answered
Every question the client raised in the document. Put the question on its own line in bold, exactly as a question, then answer it in a new paragraph directly below. Where the document doesn't settle one, say so and say what would.

## Scope and requirements
The concrete things to build: pages, features, integrations, content, and any stated constraint on stack, budget, or timeline. Use a bulleted list, one requirement per bullet.

## Gaps and risks
What a developer would have to resolve before quoting or starting: missing decisions, contradictions, and assumptions the document leaves open. One \`###\` heading per item, explanation underneath.

Reproduce exact wording for anything that pins down scope, written inline as ordinary prose — never wrapped in quotation marks.`

/**
 * Every field a chat request shares. Spread this and add `messages`.
 *
 * Requires the beta endpoint: `anthropic.beta.messages.stream({ ... })`.
 * Stream it — long answers over long documents otherwise risk an HTTP timeout.
 *
 * The `satisfies` catches misspelled and unknown parameters, and a stray
 * `budget_tokens` inside `thinking`. It will *not* catch `temperature`,
 * `top_p`, or `top_k`: the SDK still types those for older models, but Claude
 * Opus 5 rejects them with a 400 at runtime. Don't add them — steer with the
 * prompt instead.
 */
export const ANTHROPIC_REQUEST_DEFAULTS = {
  model: ANTHROPIC_MODEL,
  max_tokens: ANTHROPIC_MAX_TOKENS,
  thinking: ANTHROPIC_THINKING,
  output_config: ANTHROPIC_OUTPUT_CONFIG,
  betas: [ANTHROPIC_FALLBACK_BETA],
  fallbacks: ANTHROPIC_FALLBACKS,
  system: ANTHROPIC_SYSTEM_PROMPT,
} satisfies Partial<Anthropic.Beta.Messages.MessageCreateParams>

/**
 * Where to put `cache_control: { type: "ephemeral" }` once documents are wired
 * up: the last document block, not the system prompt.
 *
 * Caching is a prefix match and Claude Opus 5 won't cache a prefix under 512
 * tokens — the system prompt above is well short of that on its own, so a
 * breakpoint there would silently never cache. System prompt plus the documents
 * clears the bar comfortably, and that whole span is what repeats across every
 * question in a chat.
 */
export const ANTHROPIC_CACHE_CONTROL = { type: "ephemeral" } as const

/**
 * The server's own key, `ANTHROPIC_API_KEY`, or `undefined`.
 *
 * Optional, and meant for self-hosting: Trosive is bring-your-own-key, so on a
 * shared instance like trosive.com this stays unset and every workspace pays
 * with its own key. When it is set, it answers for workspaces that haven't
 * saved one. See `resolveAnthropicKey` in `lib/api-keys.ts`.
 */
export function instanceAnthropicKey() {
  return process.env.ANTHROPIC_API_KEY || undefined
}

/**
 * A client for one request, on the key that request resolved to.
 *
 * Not a singleton: the key differs per workspace, and the SDK's zero-arg
 * constructor would silently fall back to `ANTHROPIC_API_KEY` and bill the
 * server for somebody else's question. Construction is cheap; Node's global
 * agent pools the connections either way.
 */
export function createAnthropicClient(apiKey: string) {
  return new Anthropic({ apiKey })
}

export type AnthropicAnswer =
  | { ok: true; text: string }
  | {
      ok: false
      category: Anthropic.Beta.Messages.BetaRefusalStopDetails["category"]
    }

/**
 * Reads an answer out of a response, refusal-first.
 *
 * A declined request comes back as a perfectly normal HTTP 200 whose `content`
 * is empty or partial, so anything that reaches for `content[0]` breaks on it.
 * Checking `stop_reason` is the only reliable gate — `stop_details` is
 * informational and can be `null` even on a refusal.
 */
export function readAnswer(
  message: Anthropic.Beta.Messages.BetaMessage
): AnthropicAnswer {
  if (message.stop_reason === "refusal") {
    return { ok: false, category: message.stop_details?.category ?? null }
  }

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")

  return { ok: true, text }
}

/**
 * Turns an SDK failure into something worth showing a user.
 *
 * The key is the workspace's own, so the copy says "your" and points at what
 * the reader can fix: a revoked key, a key without access to the model, or an
 * Anthropic account out of credit.
 *
 * Ordered most-specific first, and `APIConnectionError` before `APIError`
 * because it's a subclass in this SDK — reversing them would swallow every
 * network failure into the generic branch.
 */
export function describeAnthropicError(error: unknown) {
  if (error instanceof Anthropic.AuthenticationError) {
    return "Anthropic rejected your API key. It may have been revoked: replace it in Settings, API key."
  }

  if (error instanceof Anthropic.PermissionDeniedError) {
    return `Your Anthropic API key isn't allowed to use ${ANTHROPIC_MODEL}. Check the key's workspace in the Anthropic Console.`
  }

  if (error instanceof Anthropic.RateLimitError) {
    return "Your Anthropic account hit its rate limit. Try that again in a moment."
  }

  if (error instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach Anthropic. Check your connection and try again."
  }

  if (error instanceof Anthropic.APIError) {
    // Out of credit comes back as a 400 whose message says so.
    if (/credit balance/i.test(error.message)) {
      return "Your Anthropic account is out of credit. Add some in the Anthropic Console, then ask again."
    }

    return `Anthropic returned an error (${error.status ?? "unknown"}).`
  }

  return "Something went wrong generating that answer."
}

/** True when Anthropic said the key itself is no good, not just the request. */
export function isInvalidKeyError(error: unknown) {
  return error instanceof Anthropic.AuthenticationError
}
