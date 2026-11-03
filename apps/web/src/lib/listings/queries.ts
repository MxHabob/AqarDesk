import {
  type ListingSearch,
  listListings,
  getListingMetrics as queryListingMetrics,
} from "@aqardesk/database/queries"
import type { ListingQuery } from "./schema"

export async function getListingRows(filters: ListingQuery) {
  const result = await listListings(toListingSearch(filters))

  return {
    ...result,
    rows: result.rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })),
  }
}

export function getListingMetrics() {
  return queryListingMetrics()
}

function toListingSearch(filters: ListingQuery): ListingSearch {
  return {
    query: filters.query,
    propertyType: filters.propertyType ?? undefined,
    listingType: filters.listingType ?? undefined,
    status: filters.status ?? undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}
