import type { PropertyType } from "@aqardesk/categories"
import { getPropertyDetails } from "@aqardesk/database/queries"
import { ArrowUpRight, MapPin, Ruler } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"
import {
  getPublicListingById,
  getPublicListingMedia,
} from "@/lib/listings/public-queries"
import { getI18n, getScopedI18n } from "@/locales/server"

type Props = {
  params: Promise<{ locale: string; listingId: string }>
}

const listingIdSchema = z.uuid()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listingId } = await params
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

  return {
    title: listing.title,
    description: listing.description ?? t("metadataDescription"),
    openGraph: {
      title: listing.title,
      description: listing.description ?? undefined,
      type: "article",
    },
  }
}

export default async function ListingDetailsPage({ params }: Props) {
  const { listingId, locale } = await params
  if (!listingIdSchema.safeParse(listingId).success) notFound()

  const listing = await getPublicListingById(listingId)
  if (!listing) notFound()

  const [propertyDetails, media, t, translate, listingT] = await Promise.all([
    getPropertyDetails(listing.propertyId, listing.propertyType),
    getPublicListingMedia(listing.id),
    getScopedI18n("publicListingDetails"),
    getI18n(),
    getScopedI18n("publicListings"),
  ])
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
    listing.neighborhood,
    listing.district,
    listing.city,
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

  const detailFacts = Object.entries(propertyDetails ?? {}).flatMap(
    ([key, value]) => {
      const label = detailLabels[key]
      if (!label || value === null || value === undefined || value === "") {
        return []
      }
      const displayValue =
        typeof value === "boolean"
          ? value
            ? t("yes")
            : t("no")
          : (enumValues[key]?.[String(value)] ?? String(value))
      return [{ label, value: displayValue }]
    }
  )

  const areaFacts = [
    listing.lotAreaM2 !== null && {
      label: t("landArea"),
      value: `${listing.lotAreaM2} ${listingT("squareMeters")}`,
    },
    listing.buildingAreaM2 !== null && {
      label: t("buildingArea"),
      value: `${listing.buildingAreaM2} ${listingT("squareMeters")}`,
    },
    listing.frontageM !== null && {
      label: t("frontage"),
      value: `${listing.frontageM} ${listingT("meters")}`,
    },
    listing.depthM !== null && {
      label: t("depth"),
      value: `${listing.depthM} ${listingT("meters")}`,
    },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact))

  const facts = [...areaFacts, ...detailFacts]
  const coordinates =
    listing.latitude && listing.longitude
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
      : null
  const description = listing.description || listing.publicNotes

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-0 pb-12 sm:pt-0 sm:pb-16">
      <nav aria-label={t("breadcrumb")} className="text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/listings"
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
              <div className="space-y-3">
                {media.slice(0, 1).map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden border border-border bg-muted"
                  >
                    {item.contentType?.startsWith("image/") ||
                    item.type === "photo" ? (
                      <div className="relative aspect-[16/9]">
                        <Image
                          src={item.url}
                          alt={item.altText || listing.title}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 100vw, 900px"
                          className="object-cover"
                          priority
                        />
                      </div>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex aspect-[16/9] items-center justify-center p-6 text-center text-sm font-medium text-primary hover:underline"
                      >
                        {item.altText ||
                          (item.type === "video"
                            ? t("watchVideo")
                            : t("openMedia"))}
                        <ArrowUpRight aria-hidden className="ms-2 size-4" />
                      </a>
                    )}
                  </div>
                ))}
                {media.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {media.slice(1).map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden border border-border bg-muted"
                      >
                        {item.contentType?.startsWith("image/") ||
                        item.type === "photo" ? (
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={item.url}
                              alt={item.altText || listing.title}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 50vw, 300px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex aspect-[4/3] items-center justify-center p-3 text-center text-xs font-medium text-primary hover:underline"
                          >
                            {item.altText ||
                              (item.type === "video"
                                ? t("watchVideo")
                                : t("openMedia"))}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                    key={fact.label}
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
              <Link
                href="/support"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                {t("contactUs")}
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
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
    </div>
  )
}
