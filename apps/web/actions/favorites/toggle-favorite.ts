"use server"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { getDatabase, schema } from "@aqardesk/database"
import { authActionClient } from "@/actions/safe-action"

export const toggleFavoriteAction = authActionClient
  .schema(z.object({ listingId: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const database = getDatabase()
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
