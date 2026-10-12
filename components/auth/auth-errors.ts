type AuthError = {
  code?: string
  message?: string
  status?: number
} | null

/**
 * Better Auth returns stable error codes; these are the ones a user can
 * actually act on. Anything else falls through to the caller's fallback so we
 * never surface a raw server string.
 */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match an account.",
  USER_ALREADY_EXISTS: "An account with that email already exists.",
  EMAIL_NOT_VERIFIED:
    "Confirm your email address first. Check your inbox for the link.",
  EMAIL_ALREADY_VERIFIED: "That address is already confirmed. Sign in instead.",
  PASSWORD_TOO_SHORT: "Passwords need to be at least 8 characters.",
  PASSWORD_TOO_LONG: "That password is too long.",
  INVALID_TOKEN: "That link is invalid or has already been used.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_PASSWORD: "That password doesn't match this account.",
  // Deleting an account without a password to confirm it needs a session
  // minted in the last hour — signing in again is the way back.
  SESSION_EXPIRED: "Sign out and sign back in, then try that again.",
  // Workspaces, members and invitations.
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION:
    "That person is already in this workspace.",
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
    "Make someone else the owner first.",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
    "Only owners and admins can invite people.",
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE:
    "You can't invite someone with that role.",
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER:
    "You can't change this member's role.",
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER:
    "You can't remove this member.",
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION:
    "This invitation was sent to a different email address.",
  INVITATION_NOT_FOUND: "This invitation has expired or was withdrawn.",
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: "This workspace is full.",
}

export function authErrorMessage(error: AuthError, fallback: string) {
  if (!error) return fallback

  if (error.status === 429) {
    return "Too many attempts. Wait a minute and try again."
  }

  if (error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code]
  }

  return error.message || fallback
}
