"use client"

import type { PropertyType } from "@aqardesk/categories"
import { ArrowUpLeft, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { ListingCard } from "@/components/marketing/listing-card"
import type { ListingPhoto } from "@/components/marketing/listing-photo-carousel"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"

export type HomepageListing = {
  id: string
  type: "sale" | "rent"
  salePrice: string | null
  monthlyRent: string | null
  currencyCode: string
  title: string
  propertyType: PropertyType
  propertyTypeLabel: string
  city: string | null
  district: string | null
  lotAreaM2: string | null
  buildingAreaM2: string | null
  coverPhoto?: { url: string; altText: string | null }
  photos?: ListingPhoto[]
}

export function FeaturedListingsSection({
  listings,
}: {
  listings: HomepageListing[]
}) {
  const t = useScopedI18n("site")
  const tListings = useScopedI18n("publicListings")
  const locale = useCurrentLocale()

  const labels = {
    sale: tListings("sale"),
    rent: tListings("rent"),
    perMonth: tListings("perMonth"),
    quickView: tListings("quickView"),
    openFullListing: tListings("openFullListing"),
    locationUnavailable: tListings("locationUnavailable"),
    propertyDetails: tListings("propertyDetails"),
    location: tListings("location"),
    price: tListings("price"),
    notAvailable: tListings("notAvailable"),
    noImage: tListings("noImage"),
    landArea: tListings("landArea"),
    buildingArea: tListings("buildingArea"),
    squareMeters: tListings("squareMeters"),
    close: tListings("close"),
    zoomImage: tListings("zoomImage"),
    zoomIn: tListings("zoomIn"),
    zoomOut: tListings("zoomOut"),
    previousImage: tListings("previousImage"),
    nextImage: tListings("nextImage"),
    imagePosition: tListings("imagePosition"),
    playSlideshow: tListings("playSlideshow"),
    pauseSlideshow: tListings("pauseSlideshow"),
  }

  return (
    <section
      aria-labelledby="homepage-featured-title"
      className="bg-background py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="font-serif text-2xl text-foreground sm:text-3xl"
              id="homepage-featured-title"
            >
              {t("featuredTitle")}
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {t("featuredDescription")}
            </p>
          </div>
          <Link
            className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
            href="/listings"
          >
            {t("browseListings")}
            <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
            <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                coverPhoto={listing.coverPhoto}
                photos={listing.photos}
                key={listing.id}
                labels={labels}
                listing={listing}
                locale={locale}
                propertyTypeLabel={listing.propertyTypeLabel}
              />
            ))}
          </div>
        ) : (
          <div className="border border-border bg-secondary px-6 py-10 text-center sm:py-14">
            <h3 className="font-serif text-xl text-foreground">
              {tListings("emptyTitle")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {tListings("emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
