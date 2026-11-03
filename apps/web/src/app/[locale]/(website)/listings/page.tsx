import { propertyCategories } from "@aqardesk/categories"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { ListingCard } from "@/components/marketing/listing-card"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import { loadPublicListingSearchParams } from "@/lib/listings/public-search-loader"
import { createPageMetadata } from "@/lib/metadata"
import { getI18n, getScopedI18n } from "@/locales/server"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata() {
  const t = await getScopedI18n("publicListings")
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/listings",
  })
}

export default async function ListingsPage({ params, searchParams }: Props) {
  const [{ locale }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  const [t, translate] = await Promise.all([
    getScopedI18n("publicListings"),
    getI18n(),
  ])
  const filters = loadPublicListingSearchParams(rawSearchParams)
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
        className="grid gap-x-4 gap-y-5 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="space-y-2 text-sm lg:col-span-2">
          <span className="font-medium">{t("search")}</span>
          <input
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder={t("search")}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("propertyType")}</span>
          <select
            name="propertyType"
            defaultValue={filters.propertyType ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          >
            <option value="">{t("allPropertyTypes")}</option>
            {propertyCategories.map((category) => (
              <option key={category.type} value={category.type}>
                {propertyTypeLabels[category.type]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("listingTypeFilter")}</span>
          <select
            name="listingType"
            defaultValue={filters.listingType ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          >
            <option value="">{t("allListingTypes")}</option>
            <option value="sale">{t("sale")}</option>
            <option value="rent">{t("rent")}</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("minPrice")}</span>
          <input
            name="minPrice"
            type="number"
            min="0"
            step="any"
            defaultValue={filters.minPrice ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("maxPrice")}</span>
          <input
            name="maxPrice"
            type="number"
            min="0"
            step="any"
            defaultValue={filters.maxPrice ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("minArea")}</span>
          <input
            name="minArea"
            type="number"
            min="0"
            step="any"
            defaultValue={filters.minArea ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("maxArea")}</span>
          <input
            name="maxArea"
            type="number"
            min="0"
            step="any"
            defaultValue={filters.maxArea ?? ""}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium">{t("sort")}</span>
          <select
            name="sort"
            defaultValue={filters.sort}
            className="h-10 w-full rounded-none border border-input bg-background px-3"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="price_asc">{t("sortPriceAsc")}</option>
            <option value="price_desc">{t("sortPriceDesc")}</option>
          </select>
        </label>
        <input type="hidden" name="pageSize" value={filters.pageSize} />
        <div className="flex items-end">
          <button
            type="submit"
            className="h-10 w-full bg-foreground px-4 font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("applyFilters")}
          </button>
        </div>
        <div className="flex items-end">
          <Link
            href="/listings"
            className="inline-flex h-10 w-full items-center justify-center border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("clearFilters")}
          </Link>
        </div>
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
