"use server"

import { getDatabase, schema } from "@aqardesk/database"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { authActionClient } from "@/actions/safe-action"

export const getFavoriteStatusAction = authActionClient
  .schema(z.object({ listingId: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const favorite = await getDatabase().query.favorites.findFirst({
      where: and(
        eq(schema.favorites.userId, ctx.user.id),
        eq(schema.favorites.listingId, parsedInput.listingId)
      ),
    })

    return { isFavorite: Boolean(favorite) }
  })
