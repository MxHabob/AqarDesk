"use client"

import { propertyTypeValues } from "@aqardesk/categories"
import { Button } from "@aqardesk/ui/components/button"
import { Input } from "@aqardesk/ui/components/input"
import { formatNumber } from "@aqardesk/utils"
import { debounce, useQueryStates } from "nuqs"
import { publicListingSearchParams } from "@/lib/listings/public-search-params"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"

export function PublicListingFilters() {
  const t = useScopedI18n("publicListings")
  const types = useScopedI18n("propertyTypes")
  const [filters, setFilters] = useQueryStates(publicListingSearchParams, {
    history: "replace",
    shallow: false,
    scroll: false,
    clearOnDefault: true,
    limitUrlUpdates: debounce(300),
  })

  function setNumberFilter(
    key: "minPrice" | "maxPrice" | "minArea" | "maxArea",
    value: string
  ) {
    void setFilters({
      [key]: value === "" ? null : Number(value),
      page: 1,
    })
  }

  function clearFilters() {
    void setFilters({
      q: "",
      propertyType: null,
      listingType: null,
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      sort: "newest",
      page: 1,
      pageSize: 12,
    })
  }

  return (
    <section
      aria-label={t("filters")}
      className="grid gap-3 border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Input
        aria-label={t("search")}
        placeholder={t("search")}
        value={filters.q}
        onChange={(event) => {
          void setFilters({ q: event.target.value, page: 1 })
        }}
      />
      <select
        aria-label={t("propertyType")}
        className="h-10 border border-input bg-background px-3 text-sm"
        value={filters.propertyType ?? ""}
        onChange={(event) => {
          void setFilters({
            propertyType: event.target.value
              ? (propertyTypeValues.find(
                  (value) => value === event.target.value
                ) ?? null)
              : null,
            page: 1,
          })
        }}
      >
        <option value="">{t("any")}</option>
        {propertyTypeValues.map((type) => (
          <option key={type} value={type}>
            {types(type)}
          </option>
        ))}
      </select>
      <select
        aria-label={t("listingTypeFilter")}
        className="h-10 border border-input bg-background px-3 text-sm"
        value={filters.listingType ?? ""}
        onChange={(event) => {
          const value = event.target.value
          void setFilters({
            listingType: value === "sale" || value === "rent" ? value : null,
            page: 1,
          })
        }}
      >
        <option value="">{t("any")}</option>
        <option value="sale">{t("sale")}</option>
        <option value="rent">{t("rent")}</option>
      </select>
      <select
        aria-label={t("sort")}
        className="h-10 border border-input bg-background px-3 text-sm"
        value={filters.sort}
        onChange={(event) => {
          const value = event.target.value
          if (
            value === "newest" ||
            value === "price_asc" ||
            value === "price_desc"
          ) {
            void setFilters({ sort: value, page: 1 })
          }
        }}
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price_asc">{t("sortPriceAsc")}</option>
        <option value="price_desc">{t("sortPriceDesc")}</option>
      </select>
      <Input
        aria-label={t("minPrice")}
        placeholder={t("minPrice")}
        type="number"
        min={0}
        value={filters.minPrice ?? ""}
        onChange={(event) => setNumberFilter("minPrice", event.target.value)}
      />
      <Input
        aria-label={t("maxPrice")}
        placeholder={t("maxPrice")}
        type="number"
        min={0}
        value={filters.maxPrice ?? ""}
        onChange={(event) => setNumberFilter("maxPrice", event.target.value)}
      />
      <Input
        aria-label={t("minArea")}
        placeholder={t("minArea")}
        type="number"
        min={0}
        value={filters.minArea ?? ""}
        onChange={(event) => setNumberFilter("minArea", event.target.value)}
      />
      <Input
        aria-label={t("maxArea")}
        placeholder={t("maxArea")}
        type="number"
        min={0}
        value={filters.maxArea ?? ""}
        onChange={(event) => setNumberFilter("maxArea", event.target.value)}
      />
      <select
        aria-label={t("pageSize")}
        className="h-10 border border-input bg-background px-3 text-sm"
        value={filters.pageSize}
        onChange={(event) => {
          const value = Number(event.target.value)
          if (value === 12 || value === 24 || value === 48) {
            void setFilters({ pageSize: value, page: 1 })
          }
        }}
      >
        {[12, 24, 48].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <Button
        className="sm:col-span-2 lg:col-span-4"
        variant="outline"
        type="button"
        onClick={clearFilters}
      >
        {t("clearFilters")}
      </Button>
    </section>
  )
}

export function PublicListingPagination({
  page,
  pageCount,
}: {
  page: number
  pageCount: number
}) {
  const t = useScopedI18n("publicListings")
  const locale = useCurrentLocale()
  const [, setFilters] = useQueryStates(publicListingSearchParams, {
    history: "replace",
    shallow: false,
    scroll: false,
    clearOnDefault: true,
  })

  return (
    <nav
      aria-label={t("pagination")}
      className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
    >
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => void setFilters({ page: page - 1 })}
      >
        {t("previousPage")}
      </Button>
      <p className="text-sm text-muted-foreground">
        {t("page")} {formatNumber(page, { locale })} /{" "}
        {formatNumber(pageCount, { locale })}
      </p>
      <Button
        variant="outline"
        disabled={page >= pageCount}
        onClick={() => void setFilters({ page: page + 1 })}
      >
        {t("nextPage")}
      </Button>
    </nav>
  )
}
