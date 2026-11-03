import {
  getPublicListingById,
  listPublicListings,
  type PublicListingSearch,
  searchPublicListings,
} from "@aqardesk/database/queries"
import type { PublicListingSearchParams } from "./public-search-loader"

export { getPublicListingById, listPublicListings as getPublicListings }

export function getFilteredPublicListings(filters: PublicListingSearchParams) {
  const pageSize = [12, 24, 48].includes(filters.pageSize)
    ? filters.pageSize
    : 12

  return searchPublicListings({
    ...toPublicListingSearch(filters),
    pageSize,
  })
}

function toPublicListingSearch(
  filters: PublicListingSearchParams
): PublicListingSearch {
  return {
    q: filters.q,
    propertyType: filters.propertyType,
    listingType: filters.listingType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minArea: filters.minArea,
    maxArea: filters.maxArea,
    sort: filters.sort,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}
