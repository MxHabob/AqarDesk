import { formatNumber } from "@aqardesk/utils"
import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import {
  PublicListingFilters,
  PublicListingPagination,
} from "@/components/listings/public-listing-filters"
import { ListingGrid } from "@/components/public/listing-grid"
import { getFilteredPublicListings } from "@/lib/listings/public-queries"
import { loadPublicListingSearchParams } from "@/lib/listings/public-search-loader"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("publicListings")

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/browse" },
  }
}

export default async function BrowsePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const locale = await initializeLocale(params)
  const filters = await loadPublicListingSearchParams(searchParams)
  const [t, categories, listings] = await Promise.all([
    getScopedI18n("publicListings"),
    getScopedI18n("propertyTypes"),
    getFilteredPublicListings(filters),
  ])

  return (
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader title={t("title")} />
      <PublicListingFilters />
      <p className="text-sm text-muted-foreground">
        {t("resultsCount")}: {formatNumber(listings.total, { locale })}
      </p>
      <ListingGrid
        listings={listings.rows}
        locale={locale}
        propertyTypeLabel={(type) => categories(type)}
        detailsLabel={t("details")}
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />
      <PublicListingPagination
        page={listings.page}
        pageCount={listings.pageCount}
      />
    </main>
  )
}
