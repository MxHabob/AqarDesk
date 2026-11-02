import type { Metadata } from "next"
import { FeaturedListings } from "@/components/public/featured-listings"
import { Hero } from "@/components/public/hero"
import { getPublicListings } from "@/lib/listings/public-queries"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("site")

  return {
    title: t("home"),
    description: t("heroDescription"),
    alternates: { canonical: "/" },
  }
}

export default async function PublicHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = await initializeLocale(params)
  const [t, categories, listings] = await Promise.all([
    getScopedI18n("site"),
    getScopedI18n("propertyTypes"),
    getPublicListings(3),
  ])

  return (
    <main className="space-y-2">
      <Hero
        eyebrow={t("heroEyebrow")}
        title={t("heroTitle")}
        description={t("heroDescription")}
        actionLabel={t("browseListings")}
      />
      <FeaturedListings
        listings={listings}
        locale={locale}
        title={t("featuredTitle")}
        description={t("featuredDescription")}
        propertyTypeLabel={(type) => categories(type)}
        detailsLabel={t("viewListing")}
        emptyLabel={t("emptyListingsDescription")}
        browseLabel={t("browseListings")}
      />
    </main>
  )
}
