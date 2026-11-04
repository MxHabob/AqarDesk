import type { PropertyType } from "@aqardesk/categories"
import {
  getOfficeSettings,
  getPropertyDetails,
} from "@aqardesk/database/queries"
import { ArrowUpRight, MapPin, Ruler } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { SearchParams } from "nuqs"
import { z } from "zod"
import { ListingCard } from "@/components/marketing/listing-card"
import { ListingPhotoCarousel } from "@/components/marketing/listing-photo-carousel"
import { ShareListingDialog } from "@/components/real-estate/share-listing-dialog"
import {
  getPublicListingById,
  getPublicListingCoverPhotos,
  getPublicListingMedia,
  getPublicListingPhotos,
  getSimilarPublicListings,
} from "@/lib/listings/public-queries"
import {
  createPageMetadata,
  createSafeJsonLd,
  getSiteUrl,
} from "@/lib/marketing/metadata"
import { getI18n, getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = {
  params: Promise<{ locale: string; listingId: string }>
  searchParams: Promise<SearchParams>
}

const listingIdSchema = z.uuid()

function getSafeListingReturnHref(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/listings"

  try {
    const url = new URL(value, "https://aqardesk.invalid")
    if (
      url.origin !== "https://aqardesk.invalid" ||
      url.pathname !== "/listings"
    ) {
      return "/listings"
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/listings"
  }
}

function getWhatsAppUrl(phone: string | null, countryCode: string) {
  if (!phone) return null

  const digits = phone.replace(/\D/g, "")
  if (!digits) return null

  const internationalNumber = digits.startsWith("00")
    ? digits.slice(2)
    : countryCode === "SA" && !digits.startsWith("966")
      ? `966${digits.startsWith("0") ? digits.slice(1) : digits}`
      : digits

  return `https://wa.me/${internationalNumber}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listingId, locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("publicListingDetails")
  if (!listingIdSchema.safeParse(listingId).success) {
    return {
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    }
  }

  const listing = await getPublicListingById(listingId)
  if (!listing) {
    return {
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    }
  }

  const coverPhotos = await getPublicListingCoverPhotos([listing.id])
  const coverPhoto = coverPhotos[listing.id]

  return createPageMetadata({
    title: listing.title,
    description:
      listing.description ?? listing.publicNotes ?? t("metadataDescription"),
    locale,
    path: `/listings/${listing.id}`,
    ...(coverPhoto && {
      ogImageUrl: getSiteUrl(
        `/api/public/listing-images/${coverPhoto.mediaId}`
      ),
    }),
    type: "article",
  })
}

export default async function ListingDetailsPage({
  params,
  searchParams,
}: Props) {
  const [{ listingId, locale }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ])
  const returnHref = getSafeListingReturnHref(rawSearchParams.returnTo)
  setStaticParamsLocale(locale)
  if (!listingIdSchema.safeParse(listingId).success) notFound()

  const listing = await getPublicListingById(listingId)
  if (!listing) notFound()

  const [
    propertyDetails,
    media,
    officeSettings,
    t,
    translate,
    listingT,
    similarListings,
  ] = await Promise.all([
    getPropertyDetails(listing.propertyId, listing.propertyType),
    getPublicListingMedia(listing.id),
    getOfficeSettings(),
    getScopedI18n("publicListingDetails"),
    getI18n(),
    getScopedI18n("publicListings"),
    getSimilarPublicListings(listing),
  ])
  const similarPhotos = await getPublicListingPhotos(
    similarListings.map((similarListing) => similarListing.id)
  )
  const listingPhotos = media
    .filter(
      (item) => item.contentType?.startsWith("image/") || item.type === "photo"
    )
    .map(({ url, altText }) => ({ url, altText }))
  const otherMedia = media.filter(
    (item) => !item.contentType?.startsWith("image/") && item.type !== "photo"
  )
  const contactUrl = getWhatsAppUrl(
    officeSettings.phone,
    officeSettings.countryCode
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
  const fieldSettings =
    officeSettings.propertyFieldSettings?.[listing.propertyType] ?? {}
  const isPubliclyVisible = (key: string) =>
    fieldSettings[key]?.visiblePublicly ??
    !["address", "primaryStreet", "secondaryStreet"].includes(key)
  const publicFieldLabel = (key: string, defaultLabel: string) =>
    fieldSettings[key]?.label || defaultLabel
  const price =
    listing.listingType === "sale" ? listing.salePrice : listing.monthlyRent
  const formattedPrice =
    price !== null
      ? `${new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
        }).format(
          Number(price)
        )} ${listing.currencyCode}${listing.listingType === "rent" ? ` / ${t("perMonth")}` : ""}`
      : listingT("notAvailable")
  const location = [
    isPubliclyVisible("neighborhood") ? listing.neighborhood : null,
    isPubliclyVisible("district") ? listing.district : null,
    isPubliclyVisible("city") ? listing.city : null,
  ].filter((value): value is string => Boolean(value))
  const formatLocation = new Intl.ListFormat(locale).format(location)
  const detailLabels: Record<string, string> = {
    currentFloors: t("currentFloors"),
    constructionDesign: t("constructionDesign"),
    deedIssuer: t("deedIssuer"),
    apartmentCount: t("apartmentCount"),
    finish: t("finish"),
    hasYard: t("hasYard"),
    hasReception: t("hasReception"),
    isFurnished: t("isFurnished"),
    hasBasement: t("hasBasement"),
    hasGuardRoom: t("hasGuardRoom"),
    investmentType: t("investmentType"),
    propertySubtype: "النوع",
    additionalDetails: t("additionalDetails"),
    previousActivity: t("previousActivity"),
    openingCount: t("openingCount"),
    toiletCount: t("toiletCount"),
    hasStorage: t("hasStorage"),
    storageDetails: t("storageDetails"),
    requestedActivity: t("requestedActivity"),
    hasFence: t("hasFence"),
    hasRoof: t("hasRoof"),
    roomCount: t("roomCount"),
    kitchenDetails: t("kitchenDetails"),
    hasSeparateMajlis: t("hasSeparateMajlis"),
    entranceCount: t("entranceCount"),
    floorNumber: t("floorNumber"),
    buildingType: t("buildingType"),
    preferredTenant: t("preferredTenant"),
  }
  const sharedFieldLabels: Record<string, string> = {
    city: t("city"),
    district: t("district"),
    neighborhood: t("neighborhood"),
    address: t("address"),
    primaryStreet: t("primaryStreet"),
    secondaryStreet: t("secondaryStreet"),
  }
  const enumValues: Record<string, Record<string, string>> = {
    finish: {
      unfinished: t("finishUnfinished"),
      basic: t("finishBasic"),
      good: t("finishGood"),
      excellent: t("finishExcellent"),
      luxury: t("finishLuxury"),
      other: t("finishOther"),
    },
    preferredTenant: {
      family: t("tenantFamily"),
      office: t("tenantOffice"),
      bachelors: t("tenantBachelors"),
      other: t("tenantOther"),
    },
  }

  const detailFacts = Object.entries(propertyDetails ?? {})
    .flatMap(([key, value]) => {
      const label = detailLabels[key]
      if (
        !label ||
        !isPubliclyVisible(key) ||
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return []
      }
      const displayValue =
        typeof value === "boolean"
          ? value
            ? t("yes")
            : t("no")
          : (enumValues[key]?.[String(value)] ?? String(value))
      return [
        {
          key,
          label: publicFieldLabel(key, label),
          value: displayValue,
          order: fieldSettings[key]?.order ?? 999,
        },
      ]
    })
    .sort((left, right) => left.order - right.order)

  const areaFacts: Array<{
    key: string
    label: string
    value: string
    order: number
  }> = []
  if (isPubliclyVisible("lotAreaM2") && listing.lotAreaM2 !== null) {
    areaFacts.push({
      key: "lotAreaM2",
      label: publicFieldLabel("lotAreaM2", t("landArea")),
      value: `${listing.lotAreaM2} ${listingT("squareMeters")}`,
      order: fieldSettings.lotAreaM2?.order ?? 999,
    })
  }
  if (isPubliclyVisible("buildingAreaM2") && listing.buildingAreaM2 !== null) {
    areaFacts.push({
      key: "buildingAreaM2",
      label: publicFieldLabel("buildingAreaM2", t("buildingArea")),
      value: `${listing.buildingAreaM2} ${listingT("squareMeters")}`,
      order: fieldSettings.buildingAreaM2?.order ?? 999,
    })
  }
  if (isPubliclyVisible("frontageM") && listing.frontageM !== null) {
    areaFacts.push({
      key: "frontageM",
      label: publicFieldLabel("frontageM", t("frontage")),
      value: `${listing.frontageM} ${listingT("meters")}`,
      order: fieldSettings.frontageM?.order ?? 999,
    })
  }
  if (isPubliclyVisible("depthM") && listing.depthM !== null) {
    areaFacts.push({
      key: "depthM",
      label: publicFieldLabel("depthM", t("depth")),
      value: `${listing.depthM} ${listingT("meters")}`,
      order: fieldSettings.depthM?.order ?? 999,
    })
  }
  areaFacts.sort((left, right) => left.order - right.order)

  const commonFacts = Object.entries(sharedFieldLabels)
    .flatMap(([key, defaultLabel]) => {
      if (!isPubliclyVisible(key)) return []
      const value = listing[key as keyof typeof listing]
      if (typeof value !== "string" || !value) return []
      return [
        {
          key,
          label: publicFieldLabel(key, defaultLabel),
          value,
          order: fieldSettings[key]?.order ?? 999,
        },
      ]
    })
    .sort((left, right) => left.order - right.order)
  const facts = [...commonFacts, ...areaFacts, ...detailFacts].sort(
    (left, right) => left.order - right.order
  )
  const coordinates =
    isPubliclyVisible("latitude") &&
    isPubliclyVisible("longitude") &&
    listing.latitude &&
    listing.longitude
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
      : null
  const description = isPubliclyVisible("description")
    ? listing.description || listing.publicNotes
    : listing.publicNotes
  const listingUrl = getSiteUrl(`/${locale}/listings/${listing.id}`)
  const listingStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: listing.title,
    description: description ?? listing.title,
    url: listingUrl,
    inLanguage: locale,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: translate("site.home"),
          item: getSiteUrl(`/${locale}`),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: translate("site.browseListings"),
          item: getSiteUrl(`/${locale}/listings`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: listing.title,
          item: listingUrl,
        },
      ],
    },
    mainEntity: {
      "@type": "Offer",
      url: listingUrl,
      name: listing.title,
      availability: "https://schema.org/InStock",
      ...(price !== null && {
        price: Number(price),
        priceCurrency: listing.currencyCode,
      }),
      itemOffered: {
        "@type": "Place",
        name: listing.title,
        address: {
          "@type": "PostalAddress",
          ...(isPubliclyVisible("neighborhood") &&
            listing.neighborhood && { streetAddress: listing.neighborhood }),
          ...(isPubliclyVisible("district") &&
            listing.district && { addressRegion: listing.district }),
          ...(isPubliclyVisible("city") &&
            listing.city && { addressLocality: listing.city }),
        },
      },
    },
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-32 pb-12">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is escaped by createSafeJsonLd.
        dangerouslySetInnerHTML={{
          __html: createSafeJsonLd(listingStructuredData),
        }}
      />
      <nav aria-label={t("breadcrumb")} className="text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={returnHref}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("backToListings")}
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground">
            /
          </li>
          <li className="text-foreground">{listing.title}</li>
        </ol>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-16">
        <div className="min-w-0 space-y-10">
          <header className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="border border-border px-3 py-1 text-xs font-medium">
                {listing.listingType === "sale"
                  ? listingT("sale")
                  : listingT("rent")}
              </span>
              <span className="text-sm text-muted-foreground">
                {propertyTypeLabels[listing.propertyType]}
              </span>
              <ShareListingDialog
                listings={[
                  {
                    id: listing.id,
                    title: listing.title,
                    listingType: listing.listingType,
                  },
                ]}
                useShortLink={false}
              />
            </div>
            <div className="space-y-3">
              <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
                {listing.title}
              </h1>
              {location.length > 0 && (
                <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin aria-hidden className="size-4 shrink-0" />
                  {formatLocation}
                </p>
              )}
            </div>
          </header>

          {media.length ? (
            <section aria-label={t("photosAndMedia")} className="space-y-4">
              <h2 className="text-lg font-medium">{t("photosAndMedia")}</h2>
              {listingPhotos.length > 0 && (
                <ListingPhotoCarousel
                  photos={listingPhotos}
                  title={listing.title}
                  noImageLabel={listingT("noImage")}
                  zoomLabel={listingT("zoomImage")}
                  zoomInLabel={listingT("zoomIn")}
                  zoomOutLabel={listingT("zoomOut")}
                  previousLabel={listingT("previousImage")}
                  nextLabel={listingT("nextImage")}
                  imagePositionLabel={listingT("imagePosition")}
                  playSlideshowLabel={listingT("playSlideshow")}
                  pauseSlideshowLabel={listingT("pauseSlideshow")}
                  presentation="detail"
                />
              )}
              {otherMedia.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {otherMedia.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-24 items-center justify-center border border-border bg-muted p-6 text-center text-sm font-medium text-primary hover:underline"
                    >
                      {item.altText ||
                        (item.type === "video"
                          ? t("watchVideo")
                          : t("openMedia"))}
                      <ArrowUpRight aria-hidden className="ms-2 size-4" />
                    </a>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center border border-dashed border-border bg-muted px-6 text-center text-sm text-muted-foreground">
              {t("noMedia")}
            </div>
          )}

          {description && (
            <section className="space-y-4 border-t border-border pt-8">
              <h2 className="font-serif text-2xl text-foreground">
                {t("description")}
              </h2>
              <p className="whitespace-pre-line leading-7 text-muted-foreground">
                {description}
              </p>
            </section>
          )}

          {facts.length > 0 && (
            <section className="space-y-5 border-t border-border pt-8">
              <h2 className="font-serif text-2xl text-foreground">
                {t("propertyFeatures")}
              </h2>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {facts.map((fact) => (
                  <div
                    key={fact.key}
                    className="flex items-start justify-between gap-4 border-b border-border py-4"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="text-end text-sm font-medium text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-32">
          <section className="border border-border p-6">
            <p className="text-xs text-muted-foreground">
              {propertyTypeLabels[listing.propertyType]}
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {formattedPrice}
            </p>
            {location.length > 0 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {formatLocation}
              </p>
            )}

            {areaFacts.length > 0 && (
              <dl className="mt-6 border-t border-border">
                {areaFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm"
                  >
                    <dt className="inline-flex items-center gap-2 text-muted-foreground">
                      <Ruler aria-hidden className="size-4" />
                      {fact.label}
                    </dt>
                    <dd className="text-end font-medium text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-base font-medium text-foreground">
                {t("contactTitle")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("contactDescription")}
              </p>
              {contactUrl && (
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  {t("contactUs")}
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
              )}
            </div>
          </section>

          {coordinates && (
            <a
              href={coordinates}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-border p-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {t("map")}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          )}
        </aside>
      </div>

      {similarListings.length > 0 && (
        <section
          aria-labelledby="similar-listings-heading"
          className="space-y-5 pt-8"
        >
          <h2
            id="similar-listings-heading"
            className="font-serif text-2xl text-foreground"
          >
            {t("similarProperties")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {similarListings.map((similarListing) => (
              <ListingCard
                key={similarListing.id}
                listing={similarListing}
                fieldSettings={officeSettings.propertyFieldSettings ?? {}}
                coverPhoto={similarPhotos[similarListing.id]?.[0]}
                photos={similarPhotos[similarListing.id]}
                propertyTypeLabel={
                  propertyTypeLabels[similarListing.propertyType]
                }
                locale={locale}
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
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
