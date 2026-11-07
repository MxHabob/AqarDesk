"use client"

import type { PropertyFieldSetting, PropertyType } from "@aqardesk/categories"
import { useInfiniteQuery } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { getPublicListingsPage } from "@/actions/public-listings"
import {
  type Listing,
  ListingCard,
  type ListingCardLabels,
} from "@/components/marketing/listing-card"
import type { ListingPhoto } from "@/components/marketing/listing-photo-carousel"

type Filters = {
  q: string
  propertyType: PropertyType | null
  listingType: "sale" | "rent" | null
  minPrice: number | null
  maxPrice: number | null
  minArea: number | null
  maxArea: number | null
  sort: "newest" | "price_asc" | "price_desc"
  pageSize: number
}

type ListingPage = {
  rows: Listing[]
  listingPhotos: Record<string, ListingPhoto[]>
  page: number
  pageCount: number
}

type Props = {
  filters: Filters
  initialPage: ListingPage
  fieldSettings: Record<string, Record<string, PropertyFieldSetting>>
  propertyTypeLabels: Record<PropertyType, string>
  locale: string
  labels: ListingCardLabels & {
    noResults: string
    loadingMore: string
    loadMoreError: string
    retry: string
  }
}

export function ListingsInfiniteResults({
  filters,
  initialPage,
  fieldSettings,
  propertyTypeLabels,
  locale,
  labels,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const queryKey = useMemo(
    () => [
      "public-listings",
      filters.q,
      filters.propertyType,
      filters.listingType,
      filters.minPrice,
      filters.maxPrice,
      filters.minArea,
      filters.maxArea,
      filters.sort,
      filters.pageSize,
    ],
    [filters]
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    initialPageParam: initialPage.page,
    initialData: {
      pages: [initialPage],
      pageParams: [initialPage.page],
    },
    queryFn: ({ pageParam }) =>
      getPublicListingsPage({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pageCount ? lastPage.page + 1 : undefined,
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    ) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage({ cancelRefetch: false })
        }
      },
      { rootMargin: "600px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage])

  const listings = data.pages.flatMap((page) => page.rows)

  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/60 px-6 py-16 text-center text-muted-foreground">
        <p className="font-medium text-foreground">{labels.noResults}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-x-6 2xl:gap-y-9">
        {data.pages.flatMap((page) =>
          page.rows.map((listing) => {
            const photos = page.listingPhotos[listing.id] ?? []
            return (
              <ListingCard
                key={listing.id}
                listing={listing}
                fieldSettings={fieldSettings}
                returnTo={`/listings?${new URLSearchParams(
                  Object.entries(filters)
                    .filter(([, value]) => value !== null && value !== "")
                    .map(([key, value]) => [key, String(value)])
                )}#listing-${listing.id}`}
                coverPhoto={photos[0]}
                photos={photos}
                propertyTypeLabel={propertyTypeLabels[listing.propertyType]}
                locale={locale}
                labels={labels}
              />
            )
          })
        )}
      </div>

      {hasNextPage && (
        <div
          ref={sentinelRef}
          className="flex min-h-12 items-center justify-center py-4 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {isFetchingNextPage && (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
              {labels.loadingMore}
            </span>
          )}
          {isFetchNextPageError && (
            <span className="inline-flex items-center gap-3">
              <span>{labels.loadMoreError}</span>
              <button
                type="button"
                onClick={() => void fetchNextPage()}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {labels.retry}
              </button>
            </span>
          )}
        </div>
      )}
    </>
  )
}
