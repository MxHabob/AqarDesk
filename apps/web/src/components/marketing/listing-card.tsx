"use client"

import type { PropertyFieldSetting, PropertyType } from "@aqardesk/categories"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aqardesk/ui/accordion"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@aqardesk/ui/components/sheet"
import { ArrowUpRight, Building2, MapPin, Ruler } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { ListingCoverImage } from "@/components/marketing/listing-cover-image"
import {
  type ListingPhoto,
  ListingPhotoCarousel,
} from "@/components/marketing/listing-photo-carousel"
import { SaveListingButton } from "@/components/marketing/save-listing-button"

export type Listing = {
  id: string
  type: "sale" | "rent"
  salePrice: string | number | null
  monthlyRent: string | number | null
  currencyCode: string
  title: string
  propertyType: PropertyType
  city: string | null
  district: string | null
  lotAreaM2: string | number | null
  buildingAreaM2: string | number | null
}

export type ListingCardLabels = {
  sale: string
  rent: string
  perMonth: string
  quickView: string
  openFullListing: string
  locationUnavailable: string
  propertyDetails: string
  location: string
  price: string
  notAvailable: string
  noImage: string
  landArea: string
  buildingArea: string
  squareMeters: string
  close: string
  zoomImage: string
  zoomIn: string
  zoomOut: string
  previousImage: string
  nextImage: string
  imagePosition: string
  playSlideshow: string
  pauseSlideshow: string
}

type ListingCardProps = {
  listing: Listing
  returnTo?: string
  coverPhoto?: { url: string; altText: string | null }
  photos?: ListingPhoto[]
  propertyTypeLabel: string
  locale: string
  labels: ListingCardLabels
  fieldSettings?: Record<string, Record<string, PropertyFieldSetting>>
}

export function ListingCard({
  listing,
  returnTo,
  coverPhoto,
  photos = [],
  propertyTypeLabel,
  locale,
  labels,
  fieldSettings,
}: ListingCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const settings = fieldSettings?.[listing.propertyType] ?? {}
  const isPubliclyVisible = (key: string) =>
    settings[key]?.visiblePublicly !== false
  const fieldLabel = (key: string, defaultLabel: string) =>
    settings[key]?.label || defaultLabel
  const price =
    listing.type === "sale" ? listing.salePrice : listing.monthlyRent
  const formattedPrice =
    price === null
      ? labels.notAvailable
      : `${new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
        }).format(
          Number(price)
        )} ${listing.currencyCode}${listing.type === "rent" ? ` / ${labels.perMonth}` : ""}`
  const location = new Intl.ListFormat(locale).format(
    [
      isPubliclyVisible("city") ? listing.city : null,
      isPubliclyVisible("district") ? listing.district : null,
    ].filter((value): value is string => Boolean(value))
  )
  const detailsHref = returnTo
    ? `/listings/${listing.id}?returnTo=${encodeURIComponent(returnTo)}`
    : `/listings/${listing.id}`
  const galleryPhotos =
    photos.length > 0 ? photos : coverPhoto ? [coverPhoto] : []

  return (
    <motion.article
      id={`listing-${listing.id}`}
      className="h-full scroll-mt-24"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
    >
      <Sheet>
        <div className="flex h-full flex-col">
          <SheetTrigger
            render={
              <button
                type="button"
                aria-label={`${labels.quickView}: ${listing.title}`}
                className="group flex w-full flex-1 flex-col text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
              {coverPhoto ? (
                <ListingCoverImage
                  src={coverPhoto.url}
                  alt={coverPhoto.altText || listing.title}
                  sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, (max-width: 1535px) 33vw, 25vw"
                  className="object-cover transition-[filter] duration-200 group-hover:brightness-95 group-focus-visible:brightness-95"
                />
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Building2 aria-hidden className="size-10 opacity-60" />
                  <span className="text-sm">{labels.noImage}</span>
                </span>
              )}
              <span className="absolute start-3 top-3 rounded-md bg-background/90 px-3 py-1 text-xs font-medium text-foreground">
                {listing.type === "sale" ? labels.sale : labels.rent}
              </span>
            </span>

            <span className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              <span className="flex items-start justify-between gap-3">
                <span className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                  {listing.title}
                </span>
                <span className="shrink-0 rounded-sm bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {propertyTypeLabel}
                </span>
              </span>

              <span className="text-lg font-semibold tracking-tight text-foreground">
                {formattedPrice}
              </span>

              <span className="flex flex-wrap gap-x-3 gap-y-2 pt-1 text-xs text-muted-foreground">
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-3.5 shrink-0" />
                    {location}
                  </span>
                ) : (
                  <span>{labels.locationUnavailable}</span>
                )}
                {isPubliclyVisible("lotAreaM2") &&
                  listing.lotAreaM2 !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Ruler aria-hidden className="size-3.5 shrink-0" />
                      {fieldLabel("lotAreaM2", labels.landArea)}:{" "}
                      {listing.lotAreaM2} {labels.squareMeters}
                    </span>
                  )}
                {isPubliclyVisible("buildingAreaM2") &&
                  listing.buildingAreaM2 !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Ruler aria-hidden className="size-3.5 shrink-0" />
                      {fieldLabel("buildingAreaM2", labels.buildingArea)}:{" "}
                      {listing.buildingAreaM2} {labels.squareMeters}
                    </span>
                  )}
              </span>
            </span>
          </SheetTrigger>

          <div className="flex items-center justify-between gap-3 px-4 pb-4 text-xs sm:px-5">
            <SaveListingButton listingId={listing.id} />
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-2 font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              }
            >
              {labels.quickView}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </SheetTrigger>
          </div>
        </div>

        <SheetContent
          side="right"
          className="!w-full sm:!w-[520px]"
          panelClassName="!flex !flex-col !overflow-hidden !p-0"
          closeLabel={labels.close}
        >
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <ListingPhotoCarousel
              photos={galleryPhotos}
              title={listing.title}
              noImageLabel={labels.noImage}
              zoomLabel={labels.zoomImage}
              zoomInLabel={labels.zoomIn}
              zoomOutLabel={labels.zoomOut}
              previousLabel={labels.previousImage}
              nextLabel={labels.nextImage}
              imagePositionLabel={labels.imagePosition}
              playSlideshowLabel={labels.playSlideshow}
              pauseSlideshowLabel={labels.pauseSlideshow}
            />

            <SheetHeader className="gap-0 border-b border-border py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <SheetTitle className="font-serif text-xl leading-tight tracking-normal normal-case">
                    {listing.title}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {propertyTypeLabel} ·{" "}
                    {location || labels.locationUnavailable}
                  </p>
                </div>
                <span className="shrink-0 border border-border px-2 py-1 text-xs text-muted-foreground">
                  {listing.type === "sale" ? labels.sale : labels.rent}
                </span>
              </div>
            </SheetHeader>

            <Accordion
              multiple
              defaultValue={["property-details"]}
              className="mt-2"
            >
              <AccordionItem value="property-details" className="border-none">
                <AccordionTrigger>{labels.propertyDetails}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <dl className="divide-y divide-border border-y border-border">
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt>{labels.price}</dt>
                      <dd className="text-end font-medium text-foreground">
                        {formattedPrice}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt>{labels.location}</dt>
                      <dd className="text-end font-medium text-foreground">
                        {location || labels.locationUnavailable}
                      </dd>
                    </div>
                    {isPubliclyVisible("lotAreaM2") &&
                      listing.lotAreaM2 !== null && (
                        <div className="flex items-center justify-between gap-4 py-3">
                          <dt>{fieldLabel("lotAreaM2", labels.landArea)}</dt>
                          <dd className="text-end font-medium text-foreground">
                            {listing.lotAreaM2} {labels.squareMeters}
                          </dd>
                        </div>
                      )}
                    {isPubliclyVisible("buildingAreaM2") &&
                      listing.buildingAreaM2 !== null && (
                        <div className="flex items-center justify-between gap-4 py-3">
                          <dt>
                            {fieldLabel("buildingAreaM2", labels.buildingArea)}
                          </dt>
                          <dd className="text-end font-medium text-foreground">
                            {listing.buildingAreaM2} {labels.squareMeters}
                          </dd>
                        </div>
                      )}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <SheetFooter className="shrink-0 border-t border-border bg-background p-4 sm:p-6">
            <Link
              href={detailsHref}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {labels.openFullListing}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </motion.article>
  )
}
