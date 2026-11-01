"use client"

import { Input } from "@aqardesk/ui/components/input"
import { useScopedI18n } from "@/locales/client"
import { useListingFilters } from "@/store/listing-filters"

export function ListingFilters() {
  const t = useScopedI18n("listings")
  const query = useListingFilters((state) => state.query)
  const setQuery = useListingFilters((state) => state.setQuery)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full max-w-sm">
        <Input
          aria-label={t("searchPlaceholder")}
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
    </div>
  )
}
