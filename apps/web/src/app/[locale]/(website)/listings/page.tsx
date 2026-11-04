import { propertyCategories } from "@aqardesk/categories"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aqardesk/ui/select"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { MaterialIcon } from "@/components/marketing/homepage/icon-mapping"
import { ListingCard } from "@/components/marketing/listing-card"
import { ListingsFilterAutoSubmit } from "@/components/marketing/listings-filter-auto-submit"
import { ListingsFiltersResponsive } from "@/components/marketing/listings-filters-responsive"
import { ListingsPageViewport } from "@/components/marketing/listings-page-viewport"
import { ListingsResultsScroller } from "@/components/marketing/listings-results-scroller"
import {
  getFilteredPublicListings,
  getPublicListingPhotos,
} from "@/lib/listings/public-queries"
import { loadPublicListingSearchParams } from "@/lib/listings/public-search-loader"
import { createPageMetadata } from "@/lib/marketing/metadata"
import { getI18n, getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const [{ locale }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("publicListings")
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    path: "/listings",
    noindex: Object.keys(rawSearchParams).length > 0,
  })
}

export default async function ListingsPage({ params, searchParams }: Props) {
  const [{ locale }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  setStaticParamsLocale(locale)
  const [t, translate] = await Promise.all([
    getScopedI18n("publicListings"),
    getI18n(),
  ])
  const filters = loadPublicListingSearchParams(rawSearchParams)
  const hasActiveFilters = Boolean(
    filters.q.trim() ||
      filters.propertyType ||
      filters.listingType ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.minArea !== null ||
      filters.maxArea !== null ||
      filters.sort !== "newest" ||
      filters.page > 1
  )
  const results = await getFilteredPublicListings(filters)
  const listingPhotos = await getPublicListingPhotos(
    results.rows.map((listing) => listing.id)
  )
  const propertyTypeLabels = {
    building: translate("propertyTypes.building"),
    land: translate("propertyTypes.land"),
    house_villa: translate("propertyTypes.house_villa"),
    investment: translate("propertyTypes.investment"),
    commercial: translate("propertyTypes.commercial"),
    warehouse: translate("propertyTypes.warehouse"),
    yard: translate("propertyTypes.yard"),
    apartment: translate("propertyTypes.apartment"),
  }

  const pageHref = (page: number, anchor = "#listings-results") => {
    const query = new URLSearchParams()
    if (filters.q) query.set("q", filters.q)
    if (filters.propertyType) query.set("propertyType", filters.propertyType)
    if (filters.listingType) query.set("listingType", filters.listingType)
    if (filters.minPrice !== null)
      query.set("minPrice", String(filters.minPrice))
    if (filters.maxPrice !== null)
      query.set("maxPrice", String(filters.maxPrice))
    if (filters.minArea !== null) query.set("minArea", String(filters.minArea))
    if (filters.maxArea !== null) query.set("maxArea", String(filters.maxArea))
    query.set("sort", filters.sort)
    query.set("page", String(page))
    query.set("pageSize", String(filters.pageSize))
    return `/listings?${query.toString()}${anchor}`
  }

  const firstVisiblePage = Math.max(
    1,
    Math.min(filters.page - 2, results.pageCount - 4)
  )
  const visiblePages = Array.from(
    { length: Math.min(5, results.pageCount) },
    (_, index) => firstVisiblePage + index
  )

  return (
    <ListingsPageViewport>
      <header className="shrink-0 border-b border-border pb-4">
        <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
          {t("title")}
        </h1>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <ListingsFiltersResponsive
          title={t("filters")}
          closeLabel={t("close")}
          resultCount={results.total}
          resultLabel={t("resultsCount")}
        >
          <form
            method="get"
            className="space-y-4 border border-border bg-background p-4"
          >
            <ListingsFilterAutoSubmit />
            {hasActiveFilters && (
              <div className="flex justify-end border-b border-border pb-3">
                <Link
                  href="/listings"
                  data-clear-listing-filters
                  className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {t("clearFilters")}
                </Link>
              </div>
            )}
            <label className="block min-w-0">
              <span className="relative block focus-within:ring-2 focus-within:ring-ring/40">
                <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                  <MaterialIcon name="search" size={16} />
                </span>
                <input
                  name="q"
                  type="search"
                  defaultValue={filters.q}
                  aria-label={t("search")}
                  placeholder={t("search")}
                  className="h-10 w-full rounded-none border border-border bg-background pe-3 ps-10 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none"
                />
              </span>
            </label>

            <fieldset className="min-w-0 space-y-2 border-t border-border pt-3">
              <legend className="text-sm font-medium">
                {t("propertyType")}
              </legend>
              <div className="space-y-1">
                {[
                  { value: "all", label: t("allPropertyTypes") },
                  ...propertyCategories.map((category) => ({
                    value: category.type,
                    label: propertyTypeLabels[category.type],
                  })),
                ].map((option) => (
                  <label
                    key={option.value}
                    className="block min-w-0 cursor-pointer"
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="propertyType"
                      value={option.value}
                      defaultChecked={
                        (filters.propertyType ?? "all") === option.value
                      }
                    />
                    <span className="flex min-h-9 items-center border-s-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary peer-checked:border-foreground peer-checked:bg-secondary peer-checked:font-medium peer-checked:text-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-2 border-t border-border pt-3">
              <legend className="text-sm font-medium">
                {t("listingTypeFilter")}
              </legend>
              <div className="grid grid-cols-3 bg-muted/50 p-1">
                {[
                  { value: "", label: t("any") },
                  { value: "sale", label: t("sale") },
                  { value: "rent", label: t("rent") },
                ].map((option, index) => (
                  <label
                    key={option.value || "all"}
                    className="min-w-0 cursor-pointer"
                  >
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="listingType"
                      value={option.value}
                      defaultChecked={
                        (filters.listingType ?? "") === option.value
                      }
                    />
                    <span
                      className={`flex min-h-9 items-center justify-center px-1 text-center text-xs transition-colors hover:bg-background/70 sm:text-sm ${
                        index > 0 ? "ms-1" : ""
                      } peer-checked:bg-background peer-checked:text-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50`}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-2 border-t border-border pt-3">
              <legend className="text-sm font-medium">{t("priceRange")}</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="sr-only">{t("minPrice")}</span>
                  <input
                    name="minPrice"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t("rangeFrom")}
                    aria-label={t("minPrice")}
                    defaultValue={filters.minPrice ?? ""}
                    className="h-9 min-w-0 w-full rounded-none border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </label>
                <label className="min-w-0">
                  <span className="sr-only">{t("maxPrice")}</span>
                  <input
                    name="maxPrice"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t("rangeTo")}
                    aria-label={t("maxPrice")}
                    defaultValue={filters.maxPrice ?? ""}
                    className="h-9 min-w-0 w-full rounded-none border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="min-w-0 space-y-2 border-t border-border pt-3">
              <legend className="text-sm font-medium">{t("areaRange")}</legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="min-w-0">
                  <span className="sr-only">{t("minArea")}</span>
                  <input
                    name="minArea"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t("rangeFrom")}
                    aria-label={t("minArea")}
                    defaultValue={filters.minArea ?? ""}
                    className="h-9 min-w-0 w-full rounded-none border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </label>
                <label className="min-w-0">
                  <span className="sr-only">{t("maxArea")}</span>
                  <input
                    name="maxArea"
                    type="number"
                    min="0"
                    step="any"
                    placeholder={t("rangeTo")}
                    aria-label={t("maxArea")}
                    defaultValue={filters.maxArea ?? ""}
                    className="h-9 min-w-0 w-full rounded-none border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </label>
              </div>
            </fieldset>

            <div className="block min-w-0 space-y-1 border-t border-border pt-3 text-xs">
              <span className="font-medium">{t("sort")}</span>
              <Select
                name="sort"
                defaultValue={filters.sort}
                items={[
                  { value: "newest", label: t("sortNewest") },
                  { value: "price_asc", label: t("sortPriceAsc") },
                  { value: "price_desc", label: t("sortPriceDesc") },
                ]}
              >
                <SelectTrigger
                  aria-label={t("sort")}
                  className="h-10 w-full border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                  <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
                  <SelectItem value="price_desc">
                    {t("sortPriceDesc")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <input type="hidden" name="pageSize" value={filters.pageSize} />
          </form>
        </ListingsFiltersResponsive>

        <ListingsResultsScroller page={filters.page}>
          <section
            aria-label={t("title")}
            className="min-w-0 space-y-4 sm:space-y-5"
          >
            <div className="hidden justify-start border-b border-border pb-3 lg:flex">
              <p className="text-sm font-medium text-muted-foreground">
                {results.total} {t("resultsCount")}
              </p>
            </div>
            {results.rows.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.rows.map((listing) => {
                  const photos = listingPhotos[listing.id] ?? []
                  const coverPhoto = photos[0]
                  return (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      returnTo={pageHref(
                        filters.page,
                        `#listing-${listing.id}`
                      )}
                      coverPhoto={coverPhoto}
                      photos={photos}
                      propertyTypeLabel={
                        propertyTypeLabels[listing.propertyType]
                      }
                      locale={locale}
                      labels={{
                        sale: t("sale"),
                        rent: t("rent"),
                        perMonth: t("perMonth"),
                        quickView: t("quickView"),
                        openFullListing: t("openFullListing"),
                        locationUnavailable: t("locationUnavailable"),
                        propertyDetails: t("propertyDetails"),
                        location: t("location"),
                        price: t("price"),
                        notAvailable: t("notAvailable"),
                        noImage: t("noImage"),
                        landArea: t("landArea"),
                        buildingArea: t("buildingArea"),
                        squareMeters: t("squareMeters"),
                        close: t("close"),
                        zoomImage: t("zoomImage"),
                        zoomIn: t("zoomIn"),
                        zoomOut: t("zoomOut"),
                        previousImage: t("previousImage"),
                        nextImage: t("nextImage"),
                        imagePosition: t("imagePosition"),
                        playSlideshow: t("playSlideshow"),
                        pauseSlideshow: t("pauseSlideshow"),
                      }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
                {t("noResults")}
              </div>
            )}
          </section>

          {results.pageCount > 1 && (
            <nav
              aria-label={t("pagination")}
              className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-5"
            >
              {results.page > 1 && (
                <Link
                  href={pageHref(results.page - 1)}
                  className="border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  {t("previousPage")}
                </Link>
              )}
              {visiblePages.map((page) =>
                page === results.page ? (
                  <span
                    key={page}
                    aria-current="page"
                    className="inline-flex size-9 items-center justify-center bg-foreground text-sm font-medium text-background"
                  >
                    {page}
                  </span>
                ) : (
                  <Link
                    key={page}
                    href={pageHref(page)}
                    aria-label={`${t("page")} ${page}`}
                    className="inline-flex size-9 items-center justify-center border border-border text-sm transition-colors hover:bg-muted"
                  >
                    {page}
                  </Link>
                )
              )}
              {results.page < results.pageCount && (
                <Link
                  href={pageHref(results.page + 1)}
                  className="border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  {t("nextPage")}
                </Link>
              )}
            </nav>
          )}
        </ListingsResultsScroller>
      </div>
    </ListingsPageViewport>
  )
}
