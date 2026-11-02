import { Button } from "@aqardesk/ui/components/button"
import type { Metadata } from "next"
import Link from "next/link"
import { ListingCard } from "@/components/public/listing-card"
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
    <main>
      <section className="border-b bg-muted/20">
        <div className="mx-auto grid min-h-[32rem] max-w-screen-xl content-center gap-6 px-5 py-20">
          <p className="text-sm font-medium text-muted-foreground">
            {t("heroEyebrow")}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            {t("heroDescription")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/browse" />}>
              {t("browseListings")}
            </Button>
            <Button
              nativeButton={false}
              variant="outline"
              render={<Link href="/login" />}
            >
              {t("officeLogin")}
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-screen-xl space-y-6 px-5 py-16">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t("featuredTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("featuredDescription")}
          </p>
        </div>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("emptyListingsDescription")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                propertyTypeLabel={categories(listing.propertyType)}
                detailsLabel={t("viewListing")}
              />
            ))}
          </div>
        )}
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/browse" />}
        >
          {t("browseListings")}
        </Button>
      </section>
    </main>
  )
}
