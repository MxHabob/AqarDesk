import type { ListingQuery } from "@/lib/listings/schema"

export type ListingRow = {
  id: string
  title: string
  propertyType: typeof import("@aqardesk/categories").propertyTypeValues[number]
  listingType: "sale" | "rent"
  status:
    | "draft"
    | "active"
    | "reserved"
    | "sold"
    | "rented"
    | "expired"
    | "withdrawn"
  salePrice: string | null
  monthlyRent: string | null
  currencyCode: string
  city: string | null
  district: string | null
  createdAt: string
}

export type ListingTableFilters = Pick<
  ListingQuery,
  | "query"
  | "propertyType"
  | "listingType"
  | "status"
  | "page"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
>
