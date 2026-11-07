import { propertyCategories } from "@aqardesk/categories"
import { getOfficeSettings } from "@aqardesk/database/queries"
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
import { ListingsFilterAutoSubmit } from "@/components/marketing/listings-filter-auto-submit"
import { ListingsFiltersResponsive } from "@/components/marketing/listings-filters-responsive"
import { ListingsInfiniteResults } from "@/components/marketing/listings-infinite-results"
import { ListingsPageViewport } from "@/components/marketing/listings-page-viewport"
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
  const officeSettings = await getOfficeSettings()
  const filters = {
    ...loadPublicListingSearchParams(rawSearchParams),
    page: 1,
    pageSize: 12,
  }
  const hasActiveFilters = Boolean(
    filters.q.trim() ||
      filters.propertyType ||
      filters.listingType ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.minArea !== null ||
      filters.maxArea !== null ||
      filters.sort !== "newest"
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

  return (
    <ListingsPageViewport>
      <header className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-7">
        <ListingsFiltersResponsive title={t("filters")} closeLabel={t("close")}>
          <form
            method="get"
            className="space-y-5 rounded-lg border border-border bg-card p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0"
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
              <span className="relative block rounded-lg focus-within:ring-2 focus-within:ring-ring/40">
                <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                  <MaterialIcon name="search" size={16} />
                </span>
                <input
                  name="q"
                  type="search"
                  defaultValue={filters.q}
                  aria-label={t("search")}
                  placeholder={t("search")}
                  className="h-11 w-full rounded-lg border border-input bg-background pe-3 ps-10 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none"
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
                    <span className="flex min-h-10 items-center rounded-md border-s-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary peer-checked:border-primary peer-checked:bg-secondary peer-checked:font-medium peer-checked:text-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50">
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
              <div className="grid grid-cols-3 rounded-lg bg-muted/60 p-1">
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
                      className={`flex min-h-9 items-center justify-center rounded-md px-1 text-center text-xs transition-colors hover:bg-background/70 sm:text-sm ${
                        index > 0 ? "ms-1" : ""
                      } peer-checked:bg-background peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50`}
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
                    className="h-10 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                    className="h-10 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                    className="h-10 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                    className="h-10 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40"
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

            <input type="hidden" name="pageSize" value="12" />
          </form>
        </ListingsFiltersResponsive>

        <div
          id="listings-results"
          className="min-w-0 scroll-mt-24 space-y-6 sm:space-y-8"
        >
          <section
            aria-label={t("title")}
            className="min-w-0 space-y-4 sm:space-y-5"
          >
            {results.rows.length ? (
              <ListingsInfiniteResults
                filters={filters}
                initialPage={{
                  rows: results.rows,
                  listingPhotos,
                  page: results.page,
                  pageCount: results.pageCount,
                }}
                fieldSettings={officeSettings.propertyFieldSettings ?? {}}
                propertyTypeLabels={propertyTypeLabels}
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
                  noResults: t("noResults"),
                  loadingMore: t("loadingMore"),
                  loadMoreError: t("loadMoreError"),
                  retry: t("retry"),
                }}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card/60 px-6 py-16 text-center text-muted-foreground">
                <p className="font-medium text-foreground">{t("noResults")}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </ListingsPageViewport>
  )
}
