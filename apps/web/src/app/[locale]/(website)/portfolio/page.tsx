import { ArrowUpLeft, ArrowUpRight, Building2, MapPin } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import { createPageMetadata } from "@/lib/marketing/metadata"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")
  return createPageMetadata({
    title: t("portfolioTitle"),
    description: t("portfolioDescription"),
    locale,
    path: "/portfolio",
  })
}

export default async function PortfolioPage({ params }: Props) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")
  const results = await getFilteredPublicListings({
    q: "",
    propertyType: null,
    listingType: null,
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    sort: "newest",
    page: 1,
    pageSize: 12,
  })
  const coverPhotos = await getPublicListingCoverPhotos(
    results.rows.map((listing) => listing.id)
  )

  return (
    <article className="mx-auto max-w-6xl py-10 sm:py-16 lg:py-20">
      <header className="grid gap-6 border-b border-border pb-8 sm:pb-10 md:grid-cols-[1fr_0.7fr] md:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("portfolioEyebrow")}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("portfolioTitle")}
          </h1>
        </div>
        <p className="max-w-xl leading-8 text-muted-foreground md:justify-self-end">
          {t("portfolioDescription")}
        </p>
      </header>

      {results.rows.length ? (
        <section
          aria-label={t("portfolioTitle")}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.rows.map((listing) => {
            const photo = coverPhotos[listing.id]
            const location = [listing.city, listing.district]
              .filter(Boolean)
              .join("، ")
            const price =
              listing.type === "sale" ? listing.salePrice : listing.monthlyRent
            const formattedPrice =
              price === null
                ? null
                : `${new Intl.NumberFormat(locale, {
                    maximumFractionDigits: 0,
                  }).format(Number(price))} ${listing.currencyCode}`

            return (
              <Link
                className="group flex h-full flex-col border border-border bg-background transition-colors hover:border-foreground/30"
                href={`/listings/${listing.id}`}
                key={listing.id}
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-secondary">
                  {photo ? (
                    <Image
                      alt={photo.altText || listing.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      src={photo.url}
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted-foreground">
                      <Building2 aria-hidden className="size-10" />
                    </span>
                  )}
                  <span className="absolute start-3 top-3 border border-border bg-background/95 px-2.5 py-1 text-xs font-medium">
                    {listing.type === "sale" ? t("forSale") : t("forRent")}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-4">
                  <span className="line-clamp-2 font-medium text-foreground">
                    {listing.title}
                  </span>
                  {location && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin aria-hidden className="size-4 shrink-0" />
                      {location}
                    </span>
                  )}
                  <span className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                    {formattedPrice ? (
                      <span className="font-semibold text-foreground">
                        {formattedPrice}
                        {listing.type === "rent" && (
                          <span className="ms-1 text-xs font-normal text-muted-foreground">
                            {t("perMonth")}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      {t("viewListing")}
                      <ArrowUpRight
                        aria-hidden
                        className="size-3.5 rtl:hidden"
                      />
                      <ArrowUpLeft
                        aria-hidden
                        className="hidden size-3.5 rtl:block"
                      />
                    </span>
                  </span>
                </span>
              </Link>
            )
          })}
        </section>
      ) : (
        <div className="mt-8 border border-dashed border-border px-6 py-16 text-center text-muted-foreground">
          {t("portfolioEmpty")}
        </div>
      )}
    </article>
  )
}
