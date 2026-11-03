import { asc, eq } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listListingMedia(
  listingId: string,
  database = getDatabase()
) {
  return database
    .select({
      id: schema.listingMedia.id,
      type: schema.listingMedia.type,
      originalFilename: schema.listingMedia.originalFilename,
      contentType: schema.listingMedia.contentType,
      altText: schema.listingMedia.altText,
      position: schema.listingMedia.position,
      isPrimary: schema.listingMedia.isPrimary,
      createdAt: schema.listingMedia.createdAt,
    })
    .from(schema.listingMedia)
    .where(eq(schema.listingMedia.listingId, listingId))
    .orderBy(asc(schema.listingMedia.position))
}

export async function createListingMedia(
  values: typeof schema.listingMedia.$inferInsert,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [media] = await transaction
      .insert(schema.listingMedia)
      .values(values)
      .returning()

    if (media) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "listing_media.created",
          entityType: "listing",
          entityId: media.listingId,
          after: { mediaId: media.id, type: media.type },
        },
        transaction
      )
    }

    return media
  }, database)
}

export async function updateListingMedia(
  id: string,
  values: Partial<
    Pick<
      typeof schema.listingMedia.$inferInsert,
      "altText" | "position" | "isPrimary" | "originalFilename"
    >
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        listingId: schema.listingMedia.listingId,
        altText: schema.listingMedia.altText,
        position: schema.listingMedia.position,
        isPrimary: schema.listingMedia.isPrimary,
      })
      .from(schema.listingMedia)
      .where(eq(schema.listingMedia.id, id))
      .limit(1)
    if (!before) return undefined

    const [media] = await transaction
      .update(schema.listingMedia)
      .set(values)
      .where(eq(schema.listingMedia.id, id))
      .returning()

    if (media) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "listing_media.updated",
          entityType: "listing",
          entityId: media.listingId,
          before,
          after: {
            mediaId: media.id,
            altText: media.altText,
            position: media.position,
            isPrimary: media.isPrimary,
          },
        },
        transaction
      )
    }

    return media
  }, database)
}

export async function deleteListingMedia(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        listingId: schema.listingMedia.listingId,
        type: schema.listingMedia.type,
      })
      .from(schema.listingMedia)
      .where(eq(schema.listingMedia.id, id))
      .limit(1)
    if (!before) return undefined

    const [media] = await transaction
      .delete(schema.listingMedia)
      .where(eq(schema.listingMedia.id, id))
      .returning({ id: schema.listingMedia.id })

    if (media) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "listing_media.deleted",
          entityType: "listing",
          entityId: before.listingId,
          before: { mediaId: media.id, type: before.type },
        },
        transaction
      )
    }

    return media
  }, database)
}
