import { createHmac, timingSafeEqual } from "node:crypto"

const unsubscribeTokenSecret = process.env.BETTER_AUTH_SECRET

function getSecret() {
  if (!unsubscribeTokenSecret || unsubscribeTokenSecret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be set to sign unsubscribe links.")
  }
  return unsubscribeTokenSecret
}

export function createUnsubscribeToken(userId: string) {
  const payload = Buffer.from(userId).toString("base64url")
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url")
  return `${payload}.${signature}`
}

export function verifyUnsubscribeToken(token: string | null) {
  if (!token) return null
  const [payload, signature, ...rest] = token.split(".")
  if (!payload || !signature || rest.length > 0) return null

  const expected = createHmac("sha256", getSecret()).update(payload).digest()
  let actual: Buffer
  try {
    actual = Buffer.from(signature, "base64url")
  } catch {
    return null
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null
  }

  try {
    const userId = Buffer.from(payload, "base64url").toString("utf8")
    return userId.length > 0 && userId.length <= 256 ? userId : null
  } catch {
    return null
  }
}
