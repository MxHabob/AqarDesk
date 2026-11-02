import { propertyTypeValues } from "@aqardesk/categories"
import {
  createLoader,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

export const loadPublicListingSearchParams = createLoader({
  q: parseAsString.withDefault(""),
  propertyType: parseAsStringEnum([...propertyTypeValues]),
  listingType: parseAsStringEnum(["sale", "rent"] as const),
  minPrice: parseAsFloat,
  maxPrice: parseAsFloat,
  minArea: parseAsFloat,
  maxArea: parseAsFloat,
  sort: parseAsStringEnum([
    "newest",
    "price_asc",
    "price_desc",
  ] as const).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(12),
})

export type PublicListingSearchParams = Awaited<
  ReturnType<typeof loadPublicListingSearchParams>
>
