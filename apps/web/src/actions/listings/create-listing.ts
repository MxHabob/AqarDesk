"use server"

import { getDatabase } from "@aqardesk/database"
import { createListing, createProperty } from "@aqardesk/database/queries"
import { authActionClient } from "@/actions/safe-action"
import { listingFormSchema } from "@/components/forms/listing-form-schema"
import { assertPermission } from "@/lib/auth/permissions"

export const createListingAction = authActionClient
  .schema(listingFormSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertPermission(ctx.user.id, "listings.create")
    await assertPermission(ctx.user.id, "properties.create")

    const database = getDatabase()
    const result = await database.transaction(async (transaction) => {
      const property = await createProperty(
        {
          type: parsedInput.propertyType,
          title: parsedInput.title,
          city: parsedInput.city || null,
          district: parsedInput.district || null,
          lotAreaM2: !parsedInput.area?.trim()
            ? null
            : String(Number(parsedInput.area)),
          createdById: ctx.user.id,
        },
        ctx.user,
        transaction
      )

      if (!property) {
        throw new Error("Property creation did not return an ID.")
      }

      const listing = await createListing(
        {
          propertyId: property.id,
          type: parsedInput.listingType,
          salePrice:
            parsedInput.listingType === "sale"
              ? String(parsedInput.price)
              : null,
          monthlyRent:
            parsedInput.listingType === "rent"
              ? String(Number(parsedInput.price))
              : null,
          currencyCode: "SAR",
          assignedToId: ctx.user.id,
        },
        ctx.user,
        transaction
      )

      if (!listing) {
        throw new Error("Listing creation did not return an ID.")
      }

      return { id: listing.id }
    })

    return result
  })
