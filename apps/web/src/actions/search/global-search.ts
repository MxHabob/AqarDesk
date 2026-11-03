"use server"

import { auth } from "@aqardesk/auth/server"
import { getPropertyCategoryLabel } from "@aqardesk/categories"
import {
  listListings,
  listOwners,
  listProperties,
} from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { z } from "zod"
import { hasPermission } from "@/lib/auth/permissions"

const searchTermSchema = z.string().trim().min(2).max(100)

export async function searchSystemAction(input: string) {
  const searchTerm = searchTermSchema.parse(input)
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const [canReadProperties, canReadListings, canReadOwners] = await Promise.all(
    [
      hasPermission(session.user.id, "properties.read"),
      hasPermission(session.user.id, "listings.read"),
      hasPermission(session.user.id, "owners.read"),
    ]
  )

  const [properties, listingResult, owners] = await Promise.all([
    canReadProperties
      ? listProperties({ query: searchTerm, pageSize: 5 })
      : Promise.resolve([]),
    canReadListings
      ? listListings({ query: searchTerm, pageSize: 5 })
      : Promise.resolve({ rows: [] }),
    canReadOwners
      ? listOwners({ query: searchTerm, pageSize: 5 })
      : Promise.resolve([]),
  ])

  return [
    ...listingResult.rows.map((listing) => ({
      id: listing.id,
      type: "listing" as const,
      title: listing.title,
      subtitle: [
        listing.listingType === "sale" ? "للبيع" : "للإيجار",
        listing.district,
        listing.city,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...properties.map((property) => ({
      id: property.id,
      type: "property" as const,
      title: property.title,
      subtitle: [
        getPropertyCategoryLabel(property.type),
        property.neighborhood,
        property.district,
        property.city,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
    ...owners.map((owner) => ({
      id: owner.id,
      type: "owner" as const,
      title: owner.name,
      subtitle: "مالك",
    })),
  ]
}
