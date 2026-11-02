import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ListingDetails } from "@/components/public/listing-details"
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

  const listingTypeLabel = listingsT(
    listing.type === "sale" ? "sale" : "rent"
  )

  return (
    <ListingDetails
      listing={listing}
      locale={locale}
      propertyTypeLabel={categories(listing.propertyType)}
      listingTypeLabel={listingTypeLabel}
      labels={{
        back: t("title"),
        location: t("location"),
        listingType: t("listingType"),
        price: t("price"),
        area: t("area"),
        notes: t("publicNotes"),
        contact: t("contactTitle"),
      }}
    />
  )
}
