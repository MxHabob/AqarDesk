import { createHash, randomBytes } from "node:crypto"

export const defaultShortLinkLifetimeDays = 30
export const maximumShortLinkLifetimeDays = 365

export function createShortLinkToken() {
  return randomBytes(32).toString("base64url")
}

export function hashShortLinkToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function getShortLinkExpiration(
  now = new Date(),
  lifetimeDays = defaultShortLinkLifetimeDays
) {
  if (
    !Number.isInteger(lifetimeDays) ||
    lifetimeDays < 1 ||
    lifetimeDays > maximumShortLinkLifetimeDays
  ) {
    throw new RangeError(
      `Short link lifetime must be between 1 and ${maximumShortLinkLifetimeDays} days.`
    )
  }

  return new Date(now.getTime() + lifetimeDays * 24 * 60 * 60 * 1000)
}
