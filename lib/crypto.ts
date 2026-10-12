import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto"

/**
 * Encryption for secrets Trosive has to read back, which today means one
 * thing: the Anthropic API key each workspace brings. Server-only.
 *
 * AES-256-GCM, with the key derived by HKDF from `BETTER_AUTH_SECRET` rather
 * than a variable of its own, so self-hosting doesn't grow another secret to
 * generate and lose. The flip side: rotating `BETTER_AUTH_SECRET` makes every
 * stored key unreadable, and workspaces have to enter theirs again.
 *
 * The output is `v1.<iv>.<tag>.<data>` in base64url. The version prefix is
 * there so a future scheme can sit beside this one while old rows are rewritten.
 */

const VERSION = "v1"
const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12

/** Distinct per purpose, so this key is never the one Better Auth signs with. */
const KEY_INFO = "trosive/api-keys/v1"

function encryptionKey() {
  const secret = process.env.BETTER_AUTH_SECRET

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set, so secrets can't be stored."
    )
  }

  return Buffer.from(hkdfSync("sha256", secret, "", KEY_INFO, 32))
}

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv)
  const data = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])

  return [
    VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    data.toString("base64url"),
  ].join(".")
}

/** Throws when the value was tampered with or sealed under another secret. */
export function decryptSecret(sealed: string) {
  const [version, iv, tag, data] = sealed.split(".")

  if (version !== VERSION || !iv || !tag || !data) {
    throw new Error("Unrecognised secret format.")
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(iv, "base64url")
  )
  decipher.setAuthTag(Buffer.from(tag, "base64url"))

  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
