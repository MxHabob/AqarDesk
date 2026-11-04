import type { HomepageListing } from "@/components/marketing/sections/featured-listings-section"
import { StartPage } from "@/components/marketing/startpage"
import {
  getPublicHomepageData,
  getPublicListingPhotos,
} from "@/lib/listings/public-queries"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import type { AppLocale } from "@/locales/config"
import { getI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: AppLocale }> }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const copy = getMarketingPageCopy("home", locale)
  return createPageMetadata({ ...copy, locale, path: "/" })
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const [translate, { results, coverPhotos }] = await Promise.all([
    getI18n(),
    getPublicHomepageData(),
  ])
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
  const listingsWithPhotos = results.rows.filter(
    (listing) => coverPhotos[listing.id]
  )
  const featuredListings = [
    ...listingsWithPhotos,
    ...results.rows.filter((listing) => !coverPhotos[listing.id]),
  ].slice(0, 3)
  const listingPhotos = await getPublicListingPhotos(
    featuredListings.map((listing) => listing.id)
  )
  const listings: HomepageListing[] = featuredListings.map((listing) => {
    const coverPhoto = coverPhotos[listing.id]
    const photos = listingPhotos[listing.id] ?? []

    return {
      ...listing,
      propertyTypeLabel: propertyTypeLabels[listing.propertyType],
      ...(coverPhoto && {
        coverPhoto: { url: coverPhoto.url, altText: coverPhoto.altText },
      }),
      photos,
    }
  })

  return <StartPage listings={listings} />
}
