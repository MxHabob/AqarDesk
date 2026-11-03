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
import { ListingCard } from "@/components/marketing/listing-card"
import { MaterialIcon } from "@/components/marketing/homepage/icon-mapping"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import { loadPublicListingSearchParams } from "@/lib/listings/public-search-loader"
import { createPageMetadata } from "@/lib/marketing/metadata"
import {
  getI18n,
  getScopedI18n,
  setStaticParamsLocale,
} from "@/locales/server"

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
    locale: locale as "ar" | "en",
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
  const coverPhotos = await getPublicListingCoverPhotos(
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

  const pageHref = (page: number) => {
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
    return `/listings?${query.toString()}`
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-12 py-12 sm:py-16">
      <header className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {t("filters")}
        </p>
        <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl leading-7 text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <form
        method="get"
        className="bg-secondary/30 p-3 sm:p-4"
      >
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <label className="min-w-0 space-y-1 text-xs min-[480px]:col-span-2 lg:col-span-4">
            <span className="font-medium">{t("search")}</span>
            <span className="relative block focus-within:ring-2 focus-within:ring-ring/40">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                <MaterialIcon name="search" size={16} />
              </span>
              <input
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder={t("search")}
                className="h-9 w-full rounded-none bg-background/80 pe-3 ps-10 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none"
              />
            </span>
          </label>
          <label className="min-w-0 space-y-1 text-xs lg:col-span-3">
            <span className="font-medium">{t("propertyType")}</span>
            <Select
              name="propertyType"
              defaultValue={filters.propertyType ?? "all"}
              items={[
                { value: "all", label: t("allPropertyTypes") },
                ...propertyCategories.map((category) => ({
                  value: category.type,
                  label: propertyTypeLabels[category.type],
                })),
              ]}
            >
              <SelectTrigger className="h-9 w-full border-0 bg-background/80 px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">{t("allPropertyTypes")}</SelectItem>
                {propertyCategories.map((category) => (
                  <SelectItem key={category.type} value={category.type}>
                    {propertyTypeLabels[category.type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <fieldset className="min-w-0 space-y-1 min-[480px]:col-span-1 lg:col-span-5">
            <legend className="text-sm font-medium">
              {t("listingTypeFilter")}
            </legend>
            <div className="grid grid-cols-3 bg-muted/50 p-1">
              {[
                { value: "", label: t("allListingTypes") },
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
                    className={`flex h-8 items-center justify-center px-2 text-center text-xs transition-colors hover:bg-background/70 sm:text-sm ${
                      index > 0 ? "ms-1" : ""
                    } peer-checked:bg-background peer-checked:text-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="min-w-0 space-y-1 lg:col-span-4">
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
                  className="h-9 min-w-0 w-full rounded-none bg-background/80 px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                  className="h-9 min-w-0 w-full rounded-none bg-background/80 px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="min-w-0 space-y-1 lg:col-span-4">
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
                  className="h-9 min-w-0 w-full rounded-none bg-background/80 px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                  className="h-9 min-w-0 w-full rounded-none bg-background/80 px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </label>
            </div>
          </fieldset>

          <label className="min-w-0 space-y-1 text-xs lg:col-span-2">
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
              <SelectTrigger className="h-9 w-full border-0 bg-background/80 px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="newest">{t("sortNewest")}</SelectItem>
                <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
                <SelectItem value="price_desc">{t("sortPriceDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div className="flex min-w-0 items-end gap-2 min-[480px]:col-span-2 lg:col-span-2">
            {hasActiveFilters && (
              <Link
                href="/listings"
                className="inline-flex h-9 flex-1 items-center justify-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t("clearFilters")}
              </Link>
            )}
            <button
              type="submit"
              className={`h-9 bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-90 ${
                hasActiveFilters ? "flex-1" : "w-full"
              }`}
            >
              {t("applyFilters")}
            </button>
          </div>
        </div>
        <input type="hidden" name="pageSize" value={filters.pageSize} />
      </form>

      <section aria-label={t("title")} className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
          <h2 className="font-serif text-2xl text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {results.total} {t("resultsCount")}
          </p>
        </div>
        {results.rows.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.rows.map((listing) => {
              const coverPhoto = coverPhotos[listing.id]
              return (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  coverPhoto={coverPhoto}
                  propertyTypeLabel={propertyTypeLabels[listing.propertyType]}
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
          className="flex items-center justify-center gap-4"
        >
          {results.page > 1 && (
            <Link
              href={pageHref(results.page - 1)}
              className="border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              {t("previousPage")}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {t("page")} {results.page} {t("of")} {results.pageCount}
          </span>
          {results.page < results.pageCount && (
            <Link
              href={pageHref(results.page + 1)}
              className="border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              {t("nextPage")}
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
