"use client"

import { organization } from "@/lib/auth-client"
import { organizationSlug, uniqueSlugSuffix } from "@/lib/organization"
import { authErrorMessage } from "@/components/auth/auth-errors"

/** Slugs are unique, and two people may well name their workspace the same. */
const SLUG_TAKEN = new Set([
  "ORGANIZATION_ALREADY_EXISTS",
  "ORGANIZATION_SLUG_ALREADY_TAKEN",
])
const SLUG_ATTEMPTS = 3

/**
 * Creates a workspace from just a name, retrying with a suffix when the slug
 * is taken. Better Auth makes the new one the active workspace, so the caller
 * only has to navigate. Shared by onboarding and the sidebar's switcher.
 */
export async function createWorkspace(
  name: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const base = organizationSlug(name)

  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
    const { error } = await organization.create({
      name,
      slug: attempt === 0 ? base : `${base}-${uniqueSlugSuffix()}`,
    })

    if (!error) return { ok: true }

    if (!error.code || !SLUG_TAKEN.has(error.code)) {
      return {
        ok: false,
        error: authErrorMessage(error, "Could not create the workspace."),
      }
    }
  }

  return { ok: false, error: "That name is taken. Try a different one." }
}
