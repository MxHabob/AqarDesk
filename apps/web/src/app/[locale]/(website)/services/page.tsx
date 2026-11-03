import {
  ArrowUpLeft,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  Handshake,
  KeyRound,
  Megaphone,
  MessagesSquare,
} from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import {
  createPageMetadata,
  getMarketingPageCopy,
} from "@/lib/marketing/metadata"
import { marketingServices } from "@/lib/marketing/services"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: string }> }

const serviceIcons = {
  sale: Building2,
  rent: KeyRound,
  investment: ChartNoAxesCombined,
  "property-management": Handshake,
  "property-marketing": Megaphone,
  "property-consultation": MessagesSquare,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return createPageMetadata({
    ...getMarketingPageCopy("services", locale),
    locale,
    path: "/services",
  })
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")
  const listings = (
    await getFilteredPublicListings({
      q: "",
      propertyType: null,
      listingType: null,
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      sort: "newest",
      page: 1,
      pageSize: 24,
    })
  ).rows

  const usedListingIds = new Set<string>()
  const listingsByService = new Map(
    marketingServices.map((service) => {
      const listing =
        listings.find(
          (candidate) =>
            !usedListingIds.has(candidate.id) &&
            (!service.listingType || candidate.type === service.listingType) &&
            (!service.propertyType ||
              candidate.propertyType === service.propertyType)
        ) ??
        listings.find((candidate) => !usedListingIds.has(candidate.id)) ??
        null

      if (listing) usedListingIds.add(listing.id)
      return [service.slug, listing] as const
    })
  )

  const featuredListing = listings[0] ?? null
  const listingIds = [
    ...new Set([
      ...(featuredListing ? [featuredListing.id] : []),
      ...[...listingsByService.values()]
        .filter((listing) => listing !== null)
        .map((listing) => listing.id),
    ]),
  ]
  const coverPhotos = await getPublicListingCoverPhotos(listingIds)
  const featuredPhoto = featuredListing
    ? coverPhotos[featuredListing.id]
    : undefined

  return (
    <article className="mx-auto max-w-6xl py-8 sm:py-12 lg:py-16">
      <header className="grid overflow-hidden border border-border bg-secondary lg:min-h-[440px] lg:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col items-start justify-center p-6 sm:p-10 lg:p-14">
          <p className="text-sm font-medium text-muted-foreground">
            {t("servicesEyebrow")}
          </p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("servicesTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            {t("servicesDescription")}
          </p>
          <Link
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            href="/listings"
          >
            {t("browseListings")}
            <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
            <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
          </Link>
        </div>

        <Link
          aria-label={featuredListing?.title ?? t("featuredTitle")}
          className="group relative block min-h-64 overflow-hidden border-t border-border bg-background lg:min-h-full lg:border-s lg:border-t-0"
          href={
            featuredListing ? `/listings/${featuredListing.id}` : "/portfolio"
          }
        >
          {featuredPhoto ? (
            <Image
              alt={
                featuredPhoto.altText ||
                featuredListing?.title ||
                t("featuredTitle")
              }
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 45vw"
              src={featuredPhoto.url}
              unoptimized
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px]">
              <Building2
                aria-hidden
                className="size-16 text-muted-foreground"
                strokeWidth={1}
              />
            </span>
          )}
          {featuredListing && (
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-background/90 p-4 backdrop-blur-sm sm:p-5">
              <span>
                <span className="block text-xs text-muted-foreground">
                  {t("featuredTitle")}
                </span>
                <span className="mt-1 block font-medium text-foreground">
                  {featuredListing.title}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-5 shrink-0 text-foreground rtl:-scale-x-100"
              />
            </span>
          )}
        </Link>
      </header>

      <section
        aria-label={t("servicesTitle")}
        className="mt-10 sm:mt-14 lg:mt-16"
      >
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4 sm:mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("servicesEyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
              {t("serviceSelectionTitle")}
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {String(marketingServices.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketingServices.map((service, index) => {
            const listing = listingsByService.get(service.slug)
            const photo = listing ? coverPhotos[listing.id] : undefined
            const Icon = serviceIcons[service.slug]

            return (
              <Link
                className="group flex h-full flex-col border border-border bg-background transition-colors hover:border-foreground/30"
                href={`/services/${service.slug}`}
                key={service.slug}
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-secondary">
                  {photo ? (
                    <Image
                      alt={
                        photo.altText ||
                        listing?.title ||
                        t(`serviceCopy.${service.copyKey}.title`)
                      }
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      src={photo.url}
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] text-muted-foreground">
                      <Icon aria-hidden className="size-10" strokeWidth={1.3} />
                    </span>
                  )}
                  {listing && (
                    <span className="absolute inset-x-0 bottom-0 truncate bg-background/90 px-4 py-3 text-xs font-medium text-foreground backdrop-blur-sm">
                      {listing.title}
                    </span>
                  )}
                  <span className="absolute end-3 top-3 border border-border bg-background/90 px-2 py-1 font-mono text-xs text-foreground backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>

                <span className="flex flex-1 flex-col p-5 sm:p-6">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon aria-hidden className="size-4" />
                    {t("servicesEyebrow")}
                  </span>
                  <span className="mt-4 font-serif text-2xl text-foreground">
                    {t(`serviceCopy.${service.copyKey}.title`)}
                  </span>
                  <span className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                    {t(`serviceCopy.${service.copyKey}.description`)}
                  </span>
                  <span className="mt-6 inline-flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-foreground">
                    {t("serviceDetails")}
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:hidden"
                    />
                    <ArrowUpLeft
                      aria-hidden
                      className="hidden size-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 rtl:block"
                    />
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-6 border border-border bg-secondary p-6 sm:mt-14 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">{t("featuredTitle")}</p>
          <h2 className="mt-2 font-serif text-2xl text-foreground">
            {t("featuredDescription")}
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          href="/portfolio"
        >
          {t("portfolioTitle")}
          <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </section>
    </article>
  )
}
