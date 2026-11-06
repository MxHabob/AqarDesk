import { createHash, timingSafeEqual } from "node:crypto"
import { getDatabase, schema } from "@aqardesk/database"
import { eq, inArray, sql } from "drizzle-orm"
import { getEmailProvider, getEmailSiteOrigin } from "@/lib/email/config"
import { expandListingCampaigns } from "@/lib/email/expand-listing-campaigns"
import { createUnsubscribeToken } from "@/lib/email/unsubscribe"

const batchSize = 25
const maxAttempts = 6
const lockTimeoutMs = 5 * 60 * 1000

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  const authorization = request.headers.get("authorization")
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) {
    return false
  }
  const provided = authorization.slice("Bearer ".length)
  if (provided.length !== secret.length) return false
  const expectedHash = createHash("sha256").update(secret).digest()
  const providedHash = createHash("sha256").update(provided).digest()
  return timingSafeEqual(expectedHash, providedHash)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const provider = getEmailProvider()
  const siteOrigin = getEmailSiteOrigin()
  const database = getDatabase()
  const now = new Date()
  const staleLock = new Date(now.getTime() - lockTimeoutMs)
  const campaignResult = await expandListingCampaigns(database, siteOrigin, now)
  const claimed = await database.transaction(async (transaction) => {
    await transaction
      .update(schema.emailOutbox)
      .set({
        status: "failed",
        lockedAt: null,
        lastError: "Worker lease expired after the maximum delivery attempts.",
        updatedAt: now,
      })
      .where(
        sql`${schema.emailOutbox.status} = 'processing' and ${schema.emailOutbox.lockedAt} < ${staleLock} and ${schema.emailOutbox.attempts} >= ${maxAttempts}`
      )

    await transaction
      .update(schema.emailOutbox)
      .set({ status: "pending", lockedAt: null, updatedAt: now })
      .where(
        sql`${schema.emailOutbox.status} = 'processing' and ${schema.emailOutbox.lockedAt} < ${staleLock} and ${schema.emailOutbox.attempts} < ${maxAttempts}`
      )

    const candidates = await transaction
      .select({
        id: schema.emailOutbox.id,
        attempts: schema.emailOutbox.attempts,
      })
      .from(schema.emailOutbox)
      .where(
        sql`${schema.emailOutbox.status} = 'pending' and ${schema.emailOutbox.availableAt} <= ${now} and ${schema.emailOutbox.attempts} < ${maxAttempts}`
      )
      .orderBy(schema.emailOutbox.availableAt, schema.emailOutbox.createdAt)
      .limit(batchSize)
      .for("update", { skipLocked: true })
    if (candidates.length === 0) return []

    return transaction
      .update(schema.emailOutbox)
      .set({
        status: "processing",
        lockedAt: now,
        attempts: sql`${schema.emailOutbox.attempts} + 1`,
        updatedAt: now,
      })
      .where(
        inArray(
          schema.emailOutbox.id,
          candidates.map((row) => row.id)
        )
      )
      .returning()
  })

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const row of claimed) {
    try {
      let recipientEmail = row.recipientEmail
      let html = row.html
      let text = row.text
      let headers = row.headers ?? undefined

      if (row.category === "listing_update") {
        if (!row.recipientUserId) {
          await database
            .update(schema.emailOutbox)
            .set({ status: "skipped", lockedAt: null, updatedAt: new Date() })
            .where(eq(schema.emailOutbox.id, row.id))
          skipped += 1
          continue
        }

        const [recipient] = await database
          .select({
            name: schema.users.name,
            email: schema.users.email,
            locale: schema.users.locale,
            emailVerified: schema.users.emailVerified,
            listingEmailNotifications: schema.users.listingEmailNotifications,
          })
          .from(schema.users)
          .where(eq(schema.users.id, row.recipientUserId))
          .limit(1)

        if (!recipient?.emailVerified || !recipient.listingEmailNotifications) {
          await database
            .update(schema.emailOutbox)
            .set({ status: "skipped", lockedAt: null, updatedAt: new Date() })
            .where(eq(schema.emailOutbox.id, row.id))
          skipped += 1
          continue
        }

        recipientEmail = recipient.email
        const unsubscribeUrl = new URL("/api/email/unsubscribe", siteOrigin)
        unsubscribeUrl.searchParams.set(
          "locale",
          recipient.locale === "en" ? "en" : "ar"
        )
        unsubscribeUrl.searchParams.set(
          "token",
          createUnsubscribeToken(row.recipientUserId)
        )
        const safeRecipientName = escapeHtml(recipient.name)
        html = html
          .replaceAll("__EMAIL_RECIPIENT_NAME__", safeRecipientName)
          .replaceAll("__EMAIL_UNSUBSCRIBE_URL__", unsubscribeUrl.toString())
        text = text
          .replaceAll("__EMAIL_RECIPIENT_NAME__", recipient.name)
          .replaceAll("__EMAIL_UNSUBSCRIBE_URL__", unsubscribeUrl.toString())
        headers = {
          ...headers,
          "List-Unsubscribe": `<${unsubscribeUrl.toString()}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      }

      const result = await provider.send(
        {
          to: recipientEmail,
          subject: row.subject,
          html,
          text,
          ...(headers ? { headers } : {}),
        },
        { idempotencyKey: row.dedupeKey }
      )

      await database
        .update(schema.emailOutbox)
        .set({
          status: "sent",
          lockedAt: null,
          sentAt: new Date(),
          providerMessageId: result.id ?? null,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.emailOutbox.id, row.id))
      sent += 1
    } catch (error) {
      const message =
        error instanceof Error ? error.message.slice(0, 1000) : "Unknown error"
      const isFinalAttempt = row.attempts >= maxAttempts
      const retryDelay = Math.min(
        60 * 60 * 1000,
        60_000 * 2 ** Math.max(0, row.attempts - 1)
      )
      await database
        .update(schema.emailOutbox)
        .set({
          status: isFinalAttempt ? "failed" : "pending",
          lockedAt: null,
          ...(isFinalAttempt
            ? {}
            : { availableAt: new Date(Date.now() + retryDelay) }),
          lastError: message,
          updatedAt: new Date(),
        })
        .where(eq(schema.emailOutbox.id, row.id))
      failed += 1
    }
  }

  return Response.json(
    {
      campaignsExpanded: campaignResult.expanded,
      campaignExpansionFailures: campaignResult.failed,
      claimed: claimed.length,
      sent,
      skipped,
      failed,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
