import { propertyTypeValues } from "@aqardesk/categories"
import { z } from "zod"

export const listingQuerySchema = z.object({
  query: z.string().trim().max(200).default(""),
  propertyType: z.enum(propertyTypeValues).nullable().default(null),
  listingType: z.enum(["sale", "rent"]).nullable().default(null),
  status: z
    .enum([
      "draft",
      "active",
      "reserved",
      "sold",
      "rented",
      "expired",
      "withdrawn",
    ])
    .nullable()
    .default(null),
  sortBy: z
    .enum(["createdAt", "title", "price", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(10).max(100).default(25),
})

export type ListingQuery = z.infer<typeof listingQuerySchema>
