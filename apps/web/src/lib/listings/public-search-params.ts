import { propertyTypeValues } from "@aqardesk/categories"
import {
  debounce,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs"

export const publicListingSearchParams = {
  q: parseAsString.withDefault("").withOptions({
    limitUrlUpdates: debounce(300),
  }),
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
}
