import type { PropertyType } from "@aqardesk/categories"
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
import Image from "next/image"
import Link from "next/link"

type Listing = {
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

type ListingCardLabels = {
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
}

type ListingCardProps = {
  listing: Listing
  coverPhoto?: { url: string; altText: string | null }
  propertyTypeLabel: string
  locale: string
  labels: ListingCardLabels
}

export function ListingCard({
  listing,
  coverPhoto,
  propertyTypeLabel,
  locale,
  labels,
}: ListingCardProps) {
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
    [listing.city, listing.district].filter((value): value is string =>
      Boolean(value)
    )
  )

  return (
    <article className="h-full">
      <Sheet>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label={`${labels.quickView}: ${listing.title}`}
              className="group flex h-full w-full flex-col border border-border bg-background text-start transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          }
        >
          <span className="relative block aspect-[4/3] w-full overflow-hidden bg-muted">
            {coverPhoto ? (
              <Image
                src={coverPhoto.url}
                alt={coverPhoto.altText || listing.title}
                fill
                unoptimized
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Building2 aria-hidden className="size-10" />
                <span className="text-sm">{labels.noImage}</span>
              </span>
            )}
            <span className="absolute start-3 top-3 border border-border bg-background/95 px-2.5 py-0.5 text-xs font-medium">
              {listing.type === "sale" ? labels.sale : labels.rent}
            </span>
          </span>

          <span className="flex flex-1 flex-col gap-3 p-4">
            <span className="flex items-start justify-between gap-3">
              <span className="line-clamp-2 text-sm font-medium text-foreground">
                {listing.title}
              </span>
              <span className="shrink-0 border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {propertyTypeLabel}
              </span>
            </span>

            <span className="text-lg font-semibold text-foreground">
              {formattedPrice}
            </span>

            <span className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden className="size-3.5 shrink-0" />
                  {location}
                </span>
              ) : (
                <span>{labels.locationUnavailable}</span>
              )}
              {listing.lotAreaM2 !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler aria-hidden className="size-3.5 shrink-0" />
                  {labels.landArea}: {listing.lotAreaM2} {labels.squareMeters}
                </span>
              )}
              {listing.buildingAreaM2 !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <Ruler aria-hidden className="size-3.5 shrink-0" />
                  {labels.buildingArea}: {listing.buildingAreaM2}{" "}
                  {labels.squareMeters}
                </span>
              )}
            </span>

            <span className="mt-auto flex items-center justify-end border-t border-border pt-3 text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                {labels.quickView}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </span>
            </span>
          </span>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="sm:max-w-xl"
          closeLabel={labels.close}
        >
          <div className="relative -mx-6 -mt-6 flex h-[200px] items-center justify-center overflow-hidden border-b border-border bg-background">
            <div
              aria-hidden
              className="absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  "radial-gradient(circle, var(--border) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
              }}
            />
            {coverPhoto ? (
              <Image
                src={coverPhoto.url}
                alt={coverPhoto.altText || listing.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 520px"
                className="object-cover p-2"
              />
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-2 text-muted-foreground">
                <Building2 aria-hidden className="size-16" />
                <span className="text-xs">{labels.noImage}</span>
              </div>
            )}
          </div>

          <SheetHeader className="gap-0 border-b border-border py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <SheetTitle className="font-serif text-xl leading-tight tracking-normal normal-case">
                  {listing.title}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  {propertyTypeLabel} · {location || labels.locationUnavailable}
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
                  {listing.lotAreaM2 !== null && (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt>{labels.landArea}</dt>
                      <dd className="text-end font-medium text-foreground">
                        {listing.lotAreaM2} {labels.squareMeters}
                      </dd>
                    </div>
                  )}
                  {listing.buildingAreaM2 !== null && (
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt>{labels.buildingArea}</dt>
                      <dd className="text-end font-medium text-foreground">
                        {listing.buildingAreaM2} {labels.squareMeters}
                      </dd>
                    </div>
                  )}
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <SheetFooter className="sticky bottom-0 border-t border-border bg-background pt-5">
            <Link
              href={`/listings/${listing.id}`}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {labels.openFullListing}
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </article>
  )
}
