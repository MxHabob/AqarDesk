"use server"

import { getDatabase, schema } from "@aqardesk/database"
import { and, eq, gt, isNull, or } from "drizzle-orm"
import { z } from "zod"
import { authActionClient } from "@/actions/safe-action"

export const toggleFavoriteAction = authActionClient
  .schema(z.object({ listingId: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const database = getDatabase()
    const [listing] = await database
      .select({ id: schema.listings.id })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(
        and(
          eq(schema.listings.id, parsedInput.listingId),
          eq(schema.listings.status, "active"),
          isNull(schema.properties.archivedAt),
          or(
            isNull(schema.listings.expiresAt),
            gt(schema.listings.expiresAt, new Date())
          )
        )
      )
      .limit(1)

    if (!listing) {
      throw new Error(
        "Cannot favorite a listing that is not publicly available."
      )
    }

    const existing = await database.query.favorites.findFirst({
      where: and(
        eq(schema.favorites.userId, ctx.user.id),
        eq(schema.favorites.listingId, parsedInput.listingId)
      ),
    })

    if (existing) {
      await database
        .delete(schema.favorites)
        .where(
          and(
            eq(schema.favorites.userId, ctx.user.id),
            eq(schema.favorites.listingId, parsedInput.listingId)
          )
        )

      return { isFavorite: false }
    }

    await database
      .insert(schema.favorites)
      .values({ userId: ctx.user.id, listingId: parsedInput.listingId })
      .onConflictDoNothing()

    return { isFavorite: true }
  })
