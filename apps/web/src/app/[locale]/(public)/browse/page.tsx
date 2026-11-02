import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { formatNumber } from "@aqardesk/utils"
import type { Metadata } from "next"
import {
  PublicListingFilters,
  PublicListingPagination,
} from "@/components/listings/public-listing-filters"
import { ListingCard } from "@/components/public/listing-card"
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
    <main className="mx-auto max-w-screen-xl space-y-8 px-5 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="text-base text-muted-foreground">{t("description")}</p>
      </header>
      <PublicListingFilters />
      <p className="text-sm text-muted-foreground">
        {t("resultsCount")}: {formatNumber(listings.total, { locale })}
      </p>
      {listings.rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("emptyTitle")}</CardTitle>
            <CardDescription>{t("emptyDescription")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.rows.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              locale={locale}
              propertyTypeLabel={categories(listing.propertyType)}
              detailsLabel={t("details")}
            />
          ))}
        </section>
      )}
      <PublicListingPagination
        page={listings.page}
        pageCount={listings.pageCount}
      />
    </main>
  )
}
