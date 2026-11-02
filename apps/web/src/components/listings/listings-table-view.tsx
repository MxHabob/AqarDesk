"use client"

import { propertyTypeValues } from "@aqardesk/categories"
import { Button } from "@aqardesk/ui/components/button"
import { useQuery } from "@tanstack/react-query"
import { getListingsAction } from "@/actions/listings/get-listings"
import type { ListingTableFilters } from "@/components/tables"
import { ListingTable } from "@/components/tables"
import { useScopedI18n } from "@/locales/client"
import { useListingQueryState } from "./listing-filters"

function isListingType(value: string): value is "sale" | "rent" {
  return value === "sale" || value === "rent"
}

function isListingStatus(
  value: string
): value is Exclude<ListingTableFilters["status"], null> {
  return [
    "draft",
    "active",
    "reserved",
    "sold",
    "rented",
    "expired",
    "withdrawn",
  ].includes(value)
}

function isSortBy(value: string): value is ListingTableFilters["sortBy"] {
  return ["createdAt", "title", "price", "status"].includes(value)
}

export function ListingsTableView() {
  const t = useScopedI18n("listings")
  const common = useScopedI18n("common")
  const [filters, setFilters] = useListingQueryState()
  const propertyType =
    propertyTypeValues.find((type) => type === filters.propertyType) ?? null
  const listingType = isListingType(filters.listingType)
    ? filters.listingType
    : null
  const status = isListingStatus(filters.status) ? filters.status : null
  const sortBy = isSortBy(filters.sortBy) ? filters.sortBy : "createdAt"
  const sortOrder = filters.sortOrder === "asc" ? "asc" : "desc"
  const page = Math.max(1, filters.page)
  const pageSize = [10, 25, 50, 100].includes(filters.pageSize)
    ? filters.pageSize
    : 25

  const listings = useQuery({
    queryKey: [
      "listings",
      filters.q,
      propertyType,
      listingType,
      status,
      page,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const result = await getListingsAction({
        query: filters.q,
        propertyType,
        listingType,
        status,
        page,
        pageSize,
        sortBy,
        sortOrder,
      })

      if (!result?.data) {
        throw new Error(result?.serverError ?? t("loadError"))
      }

      return result.data
    },
    placeholderData: (previous) => previous,
  })

  if (listings.isError) {
    return (
      <div
        role="alert"
        className="flex items-center justify-between gap-4 border p-4"
      >
        <p className="text-sm text-destructive">{t("loadError")}</p>
        <Button size="sm" variant="outline" onClick={() => listings.refetch()}>
          {common("retry")}
        </Button>
      </div>
    )
  }

  return (
    <ListingTable
      rows={listings.data?.rows ?? []}
      total={listings.data?.total ?? 0}
      page={page}
      pageSize={pageSize}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onPageChange={(nextPage) => setFilters({ page: nextPage })}
      onPageSizeChange={(nextPageSize) =>
        setFilters({ pageSize: nextPageSize, page: 1 })
      }
      onSortChange={(nextSortBy, nextSortOrder) =>
        setFilters({
          sortBy: nextSortBy,
          sortOrder: nextSortOrder,
          page: 1,
        })
      }
    />
  )
}
