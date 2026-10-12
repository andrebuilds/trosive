/**
 * The usage page's shapes and its one piece of date arithmetic.
 *
 * The window is the calendar month, the same one `countQuestionsThisMonth`
 * counts from. Nothing is capped or billed here: answers run on the
 * workspace's own Anthropic key, and Anthropic's console has the costs.
 */

/** Days of history in the "Questions per day" chart. */
export const USAGE_CHART_DAYS = 14

/** How many documents the "most-questioned" list shows. */
export const USAGE_TOP_DOCUMENTS = 5

export type UsagePeriod = {
  /** ISO dates for the first and last day of the current month. */
  start: string
  end: string
}

/** The month the page reports on. */
export function usagePeriod(now: Date = new Date()): UsagePeriod {
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  // The last day of this month is the day before the next month begins.
  const end = new Date(nextStart.getTime() - 1)

  return { start: start.toISOString(), end: end.toISOString() }
}

/** "Aug 1 – Aug 31, 2026". */
export function formatPeriod(period: UsagePeriod) {
  const start = new Date(period.start)
  const end = new Date(period.end)
  const day = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return `${day(start)} – ${day(end)}, ${end.getFullYear()}`
}

/** "1.1s", "19s", "2m 04s" — an answer's wall-clock time, read at a glance. */
export function formatDuration(seconds: number) {
  if (seconds < 10) return `${seconds.toFixed(1)}s`
  if (seconds < 60) return `${Math.round(seconds)}s`

  const minutes = Math.floor(seconds / 60)

  return `${minutes}m ${String(Math.round(seconds % 60)).padStart(2, "0")}s`
}

/** One column of the questions-per-day chart. */
export type UsageDay = {
  /** `YYYY-MM-DD`, the local day the questions were asked on. */
  date: string
  questions: number
}

/** A row of the "most-questioned documents" list. */
export type UsageDocument = {
  id: string
  name: string
  /** Answers that cited this document — see `getUsage` for why that's the count. */
  questions: number
}

export type UsageView = {
  period: UsagePeriod
  /** Questions asked this month. */
  questions: number
  documentsIndexed: number
  /** Citations across every answer Trosive has written for this workspace. */
  citations: number
  /** Mean seconds from question to finished answer; null with nothing to time. */
  averageAnswerSeconds: number | null
  days: UsageDay[]
  documents: UsageDocument[]
}
