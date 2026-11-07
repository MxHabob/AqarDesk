import {
  auth,
  isEmailOtpConfigured,
  isGoogleAuthConfigured,
} from "@aqardesk/auth/server"
import type { PropertyType } from "@aqardesk/categories"
import {
  getOfficeSettings,
  listUserFavorites,
} from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { FavoriteListingsGrid } from "@/components/account/favorite-listings-grid"
import { getPublicListingPhotos } from "@/lib/listings/public-queries"
import { getI18n, getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("account")

  return {
    title: t("favoritesTitle"),
    robots: { index: false, follow: false },
  }
}

export default async function AccountFavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const [t, listingT, translate, officeSettings] = await Promise.all([
    getScopedI18n("account"),
    getScopedI18n("publicListings"),
    getI18n(),
    getOfficeSettings(),
  ])
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const listings = await listUserFavorites(session.user.id)
  const photos = await getPublicListingPhotos(
    listings.map((listing) => listing.listingId)
  )
  const propertyTypeLabels: Record<PropertyType, string> = {
    building: translate("propertyTypes.building"),
    land: translate("propertyTypes.land"),
    house_villa: translate("propertyTypes.house_villa"),
    investment: translate("propertyTypes.investment"),
    commercial: translate("propertyTypes.commercial"),
    warehouse: translate("propertyTypes.warehouse"),
    yard: translate("propertyTypes.yard"),
    apartment: translate("propertyTypes.apartment"),
  }
  const favoriteListings = listings.map((listing) => ({
    id: listing.listingId,
    type: listing.listingType,
    salePrice: listing.salePrice,
    monthlyRent: listing.monthlyRent,
    currencyCode: listing.currencyCode,
    title: listing.title,
    propertyType: listing.propertyType,
    city: listing.city,
    district: listing.district,
    lotAreaM2: listing.lotAreaM2,
    buildingAreaM2: listing.buildingAreaM2,
  }))

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("favoritesTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("favoritesDescription")}
        </p>
      </div>
      <FavoriteListingsGrid
        listings={favoriteListings}
        photos={photos}
        favoriteIds={favoriteListings.map((listing) => listing.id)}
        fieldSettings={officeSettings.propertyFieldSettings ?? {}}
        propertyTypeLabels={propertyTypeLabels}
        locale={locale}
        emptyLabel={t("emptyFavorites")}
        googleEnabled={isGoogleAuthConfigured}
        emailOtpEnabled={isEmailOtpConfigured}
        labels={{
          sale: listingT("sale"),
          rent: listingT("rent"),
          perMonth: listingT("perMonth"),
          quickView: listingT("quickView"),
          openFullListing: listingT("openFullListing"),
          locationUnavailable: listingT("locationUnavailable"),
          propertyDetails: listingT("propertyDetails"),
          location: listingT("location"),
          price: listingT("price"),
          notAvailable: listingT("notAvailable"),
          noImage: listingT("noImage"),
          landArea: listingT("landArea"),
          buildingArea: listingT("buildingArea"),
          squareMeters: listingT("squareMeters"),
          close: listingT("close"),
          zoomImage: listingT("zoomImage"),
          zoomIn: listingT("zoomIn"),
          zoomOut: listingT("zoomOut"),
          previousImage: listingT("previousImage"),
          nextImage: listingT("nextImage"),
          imagePosition: listingT("imagePosition"),
          playSlideshow: listingT("playSlideshow"),
          pauseSlideshow: listingT("pauseSlideshow"),
        }}
      />
    </section>
  )
}
