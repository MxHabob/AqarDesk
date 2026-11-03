"use server"

import { toggleListingFavorite } from "@aqardesk/database/queries"
import { z } from "zod"
import { authActionClient } from "@/actions/safe-action"
import { getPublicListingById } from "@/lib/listings/public-queries"

export const toggleFavoriteAction = authActionClient
  .schema(z.object({ listingId: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const listing = await getPublicListingById(parsedInput.listingId)
    if (!listing) {
      throw new Error(
        "Cannot favorite a listing that is not publicly available."
      )
    }

    return {
      isFavorite: await toggleListingFavorite(
        ctx.user.id,
        parsedInput.listingId
      ),
    }
  })
