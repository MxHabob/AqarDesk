import { type getDatabase, schema } from "@aqardesk/database"
import { createListingUpdateEmail } from "@aqardesk/email"
import { and, asc, eq, gt, isNull, lte, or, sql } from "drizzle-orm"

const campaignRecipientBatchSize = 100
const campaignExpansionLimit = 3
const maxAttempts = 6
const lockTimeoutMs = 5 * 60 * 1000

export async function expandListingCampaigns(
  database: ReturnType<typeof getDatabase>,
  siteOrigin: string,
  now: Date
) {
  let expanded = 0
  let failed = 0

  await database
    .update(schema.emailCampaigns)
    .set({
      status: "failed",
      lockedAt: null,
      lastError: "Campaign lease expired after the maximum expansion attempts.",
      updatedAt: now,
    })
    .where(
      sql`${schema.emailCampaigns.status} = 'processing' and ${schema.emailCampaigns.lockedAt} < ${new Date(now.getTime() - lockTimeoutMs)} and ${schema.emailCampaigns.attempts} >= ${maxAttempts}`
    )

  for (
    let batchIndex = 0;
    batchIndex < campaignExpansionLimit;
    batchIndex += 1
  ) {
    let campaignId: string | null = null
    let attempt = 0

    try {
      const didExpand = await database.transaction(async (transaction) => {
        const [campaign] = await transaction
          .select()
          .from(schema.emailCampaigns)
          .where(
            sql`(${schema.emailCampaigns.status} = 'pending' and ${schema.emailCampaigns.availableAt} <= ${now} and ${schema.emailCampaigns.attempts} < ${maxAttempts}) or (${schema.emailCampaigns.status} = 'processing' and ${schema.emailCampaigns.lockedAt} < ${new Date(now.getTime() - lockTimeoutMs)} and ${schema.emailCampaigns.attempts} < ${maxAttempts})`
          )
          .orderBy(asc(schema.emailCampaigns.createdAt))
          .limit(1)
          .for("update", { skipLocked: true })

        if (!campaign) return false
        campaignId = campaign.id
        attempt = campaign.attempts + 1

        await transaction
          .update(schema.emailCampaigns)
          .set({
            status: "processing",
            lockedAt: now,
            attempts: attempt,
            updatedAt: now,
          })
          .where(eq(schema.emailCampaigns.id, campaign.id))

        const recipientConditions = [
          eq(schema.users.emailVerified, true),
          eq(schema.users.listingEmailNotifications, true),
          lte(schema.users.createdAt, campaign.createdAt),
          or(
            isNull(schema.users.listingEmailNotificationsUpdatedAt),
            lte(
              schema.users.listingEmailNotificationsUpdatedAt,
              campaign.createdAt
            )
          ),
          campaign.lastRecipientUserId
            ? gt(schema.users.id, campaign.lastRecipientUserId)
            : undefined,
        ]
        const recipients = await transaction
          .select({
            id: schema.users.id,
            email: schema.users.email,
            locale: schema.users.locale,
          })
          .from(schema.users)
          .where(and(...recipientConditions))
          .orderBy(asc(schema.users.id))
          .limit(campaignRecipientBatchSize + 1)

        const batch = recipients.slice(0, campaignRecipientBatchSize)
        if (batch.length > 0) {
          const listingUrls = {
            ar: new URL(
              `/ar/listings/${campaign.listingId}`,
              siteOrigin
            ).toString(),
            en: new URL(
              `/en/listings/${campaign.listingId}`,
              siteOrigin
            ).toString(),
          }
          const formatPrice = (locale: "ar" | "en") =>
            `${new Intl.NumberFormat(locale).format(Number(campaign.price))} ${campaign.currencyCode}`
          const listingType = campaign.listingType === "sale" ? "sale" : "rent"
          const office = await transaction
            .select({ name: schema.officeSettings.name })
            .from(schema.officeSettings)
            .where(eq(schema.officeSettings.id, "default"))
            .limit(1)
          const officeName = office[0]?.name.trim() || "AqarDesk"

          const [arabicEmail, englishEmail] = await Promise.all([
            createListingUpdateEmail({
              to: "subscriber@example.invalid",
              recipientName: "__EMAIL_RECIPIENT_NAME__",
              officeName,
              locale: "ar",
              propertyTitle: campaign.propertyTitle,
              listingType,
              price: formatPrice("ar"),
              listingUrl: listingUrls.ar,
            }),
            createListingUpdateEmail({
              to: "subscriber@example.invalid",
              recipientName: "__EMAIL_RECIPIENT_NAME__",
              officeName,
              locale: "en",
              propertyTitle: campaign.propertyTitle,
              listingType,
              price: formatPrice("en"),
              listingUrl: listingUrls.en,
            }),
          ])

          const outboxRows = batch.map((recipient) => {
            const email = recipient.locale === "en" ? englishEmail : arabicEmail
            return {
              dedupeKey: `listing:${campaign.listingId}:${recipient.id}`,
              recipientUserId: recipient.id,
              recipientEmail: recipient.email,
              category: "listing_update",
              subject: email.subject,
              html: email.html,
              text: email.text,
            }
          })

          if (outboxRows.length > 0) {
            await transaction
              .insert(schema.emailOutbox)
              .values(outboxRows)
              .onConflictDoNothing({
                target: schema.emailOutbox.dedupeKey,
              })
          }
        }

        const hasMoreRecipients = recipients.length > campaignRecipientBatchSize
        await transaction
          .update(schema.emailCampaigns)
          .set({
            status: hasMoreRecipients ? "pending" : "completed",
            lastRecipientUserId:
              batch.at(-1)?.id ?? campaign.lastRecipientUserId,
            lockedAt: null,
            availableAt: now,
            completedAt: hasMoreRecipients ? null : now,
            attempts: 0,
            lastError: null,
            updatedAt: now,
          })
          .where(eq(schema.emailCampaigns.id, campaign.id))

        return true
      })

      if (!didExpand) break
      expanded += 1
    } catch (error) {
      if (!campaignId) throw error
      const message =
        error instanceof Error ? error.message.slice(0, 1000) : "Unknown error"
      const retryDelay = Math.min(
        60 * 60 * 1000,
        60_000 * 2 ** Math.max(0, attempt - 1)
      )
      await database
        .update(schema.emailCampaigns)
        .set({
          status: attempt >= maxAttempts ? "failed" : "pending",
          attempts: attempt,
          availableAt: new Date(Date.now() + retryDelay),
          lockedAt: null,
          lastError: message,
          updatedAt: new Date(),
        })
        .where(eq(schema.emailCampaigns.id, campaignId))
      console.error("Failed to expand an email campaign batch.", {
        campaignId,
        error,
      })
      failed += 1
    }
  }

  return { expanded, failed }
}
