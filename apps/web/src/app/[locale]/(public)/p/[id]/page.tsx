import { Button } from "@aqardesk/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import { formatCurrency, formatNumber } from "@aqardesk/utils"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FavoriteToggleButton } from "@/components/account/favorite-toggle-button"
import { getPublicListingById } from "@/lib/listings/public-queries"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const { id } = await params
  const t = await getScopedI18n("publicListings")
  const listing = await getPublicListingById(id)

  if (!listing) {
    return {
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    }
  }

  return {
    title: listing.title,
    description: listing.description ?? t("description"),
    alternates: { canonical: `/p/${listing.id}` },
  }
}

export default async function PublicListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const locale = await initializeLocale(params)
  const { id } = await params
  const [t, categories, listingsT] = await Promise.all([
    getScopedI18n("publicListings"),
    getScopedI18n("propertyTypes"),
    getScopedI18n("listings"),
  ])
  const listing = await getPublicListingById(id)

  if (!listing) {
    notFound()
  }

  const price =
    listing.type === "sale" ? listing.salePrice : listing.monthlyRent
  const location = [
    listing.city,
    listing.district,
    listing.neighborhood,
  ].filter(Boolean)

  return (
    <main className="mx-auto max-w-screen-xl space-y-6 px-5 py-16">
      <Button
        nativeButton={false}
        variant="outline"
        render={<Link href="/browse" />}
      >
        {t("title")}
      </Button>
      <Card>
        <CardHeader>
          <CardDescription>{categories(listing.propertyType)}</CardDescription>
          <CardTitle className="text-3xl">{listing.title}</CardTitle>
          {listing.description && (
            <CardDescription>{listing.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">{t("location")}</dt>
              <dd className="mt-1">
                {location.join(locale === "ar" ? "، " : ", ")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("listingType")}
              </dt>
              <dd className="mt-1">
                {listingsT(listing.type === "sale" ? "sale" : "rent")}
              </dd>
            </div>
            {price !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">{t("price")}</dt>
                <dd className="mt-1 font-medium">
                  {formatCurrency(price, listing.currencyCode, {
                    locale,
                    options: { maximumFractionDigits: 0 },
                  })}
                </dd>
              </div>
            )}
            {listing.lotAreaM2 !== null && (
              <div>
                <dt className="text-sm text-muted-foreground">{t("area")}</dt>
                <dd className="mt-1">
                  {formatNumber(listing.lotAreaM2, { locale })} m²
                </dd>
              </div>
            )}
          </dl>
          {listing.publicNotes && (
            <section className="space-y-2 border-t pt-5">
              <h2 className="font-semibold">{t("publicNotes")}</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {listing.publicNotes}
              </p>
            </section>
          )}
          <section className="space-y-2 border-t pt-5">
            <h2 className="font-semibold">{t("contactTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("contactDescription")}
            </p>
            <FavoriteToggleButton listingId={listing.id} />
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
