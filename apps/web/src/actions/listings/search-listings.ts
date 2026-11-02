"use server"

import { authActionClient } from "@/actions/safe-action"
import { assertPermission } from "@/lib/auth/permissions"
import { getListingRows } from "@/lib/listings/queries"
import { listingQuerySchema } from "@/lib/listings/schema"

export const searchListingsAction = authActionClient
  .schema(listingQuerySchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission(ctx.user.id, "listings.read")
    return getListingRows({ ...parsedInput, page: 1, pageSize: 8 })
  })
