"use server"

import { isListingFavorite } from "@aqardesk/database/queries"
import { z } from "zod"
import { authActionClient } from "@/actions/safe-action"

export const getFavoriteStatusAction = authActionClient
  .schema(z.object({ listingId: z.uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    return {
      isFavorite: await isListingFavorite(ctx.user.id, parsedInput.listingId),
    }
  })
