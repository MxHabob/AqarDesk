"use server"

import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"
import {
  getFilteredPublicListings,
  getPublicListingPhotos,
} from "@/lib/listings/public-queries"

const listingFiltersSchema = z.object({
  q: z.string().max(200),
  propertyType: z.enum(propertyTypeValues).nullable(),
  listingType: z.enum(["sale", "rent"]).nullable(),
  minPrice: z.number().finite().nonnegative().nullable(),
  maxPrice: z.number().finite().nonnegative().nullable(),
  minArea: z.number().finite().nonnegative().nullable(),
  maxArea: z.number().finite().nonnegative().nullable(),
  sort: z.enum(["newest", "price_asc", "price_desc"]),
  page: z.number().int().min(1).max(10_000),
})

export async function getPublicListingsPage(input: {
  q: string
  propertyType: (typeof propertyTypeValues)[number] | null
  listingType: "sale" | "rent" | null
  minPrice: number | null
  maxPrice: number | null
  minArea: number | null
  maxArea: number | null
  sort: "newest" | "price_asc" | "price_desc"
  page: number
}) {
  const filters = listingFiltersSchema.parse(input)
  const results = await getFilteredPublicListings({
    ...filters,
    pageSize: 12,
  })
  const listingPhotos = await getPublicListingPhotos(
    results.rows.map((listing) => listing.id)
  )

  return {
    rows: results.rows,
    listingPhotos,
    page: results.page,
    pageCount: results.pageCount,
  }
}
