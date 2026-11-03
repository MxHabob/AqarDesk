import { ArrowUpLeft, ArrowUpRight, Check, MapPin } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getFilteredPublicListings,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import { createPageMetadata } from "@/lib/marketing/metadata"
import { getMarketingService } from "@/lib/marketing/services"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const service = getMarketingService(slug)
  if (!service) notFound()

  const language = locale === "ar" ? "ar" : "en"
  return createPageMetadata({
    title: service.title[language],
    description: service.description[language],
    locale,
    path: `/services/${service.slug}`,
  })
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setStaticParamsLocale(locale)
  const service = getMarketingService(slug)
  if (!service) notFound()

  const language = locale === "ar" ? "ar" : "en"
  const t = await getScopedI18n("site")
  const filters = {
    q: "",
    propertyType: service.propertyType ?? null,
    listingType: service.listingType,
    minPrice: null,
    maxPrice: null,
    minArea: null,
    maxArea: null,
    sort: "newest" as const,
    page: 1,
    pageSize: 12,
  }
  const results = await getFilteredPublicListings(filters)
  const listings =
    results.rows.length || !service.propertyType
      ? results.rows
      : (
          await getFilteredPublicListings({
            ...filters,
            propertyType: null,
          })
        ).rows
  const featuredListing = listings[0]
  const coverPhotos = await getPublicListingCoverPhotos(
    featuredListing ? [featuredListing.id] : []
  )
  const photo = featuredListing ? coverPhotos[featuredListing.id] : undefined

  return (
    <article className="mx-auto max-w-6xl py-10 sm:py-16 lg:py-20">
      <header className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-14 lg:pb-14">
        <div>
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            href="/services"
          >
            {t("servicesEyebrow")}
          </Link>
          <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {service.title[language]}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {service.details[language]}
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            href={
              featuredListing
                ? `/listings/${featuredListing.id}`
                : service.listingType
                  ? `/listings?listingType=${service.listingType}`
                  : "/listings"
            }
          >
            {featuredListing ? t("viewListing") : t("browseListings")}
            <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
            <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
          </Link>
        </div>

        <Link
          aria-label={featuredListing?.title ?? service.title[language]}
          className="group relative block aspect-[4/3] overflow-hidden border border-border bg-secondary"
          href={
            featuredListing ? `/listings/${featuredListing.id}` : "/listings"
          }
        >
          {photo ? (
            <Image
              alt={
                photo.altText ||
                featuredListing?.title ||
                service.title[language]
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 1023px) 100vw, 45vw"
              src={photo.url}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px]">
              <span className="font-serif text-2xl text-muted-foreground">
                {service.title[language]}
              </span>
            </div>
          )}
          {featuredListing && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-background/90 p-4 text-sm backdrop-blur-sm">
              <span className="font-medium text-foreground">
                {featuredListing.title}
              </span>
              {(featuredListing.city || featuredListing.district) && (
                <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground">
                  <MapPin aria-hidden className="size-4" />
                  {[featuredListing.city, featuredListing.district]
                    .filter(Boolean)
                    .join("، ")}
                </span>
              )}
            </div>
          )}
        </Link>
      </header>

      <section className="grid gap-10 py-10 sm:py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("serviceDetails")}
          </p>
          <h2 className="mt-3 font-serif text-2xl text-foreground sm:text-3xl">
            {service.title[language]}
          </h2>
        </div>
        <ul className="divide-y divide-border border-y border-border">
          {service.points[language].map((point) => (
            <li
              className="flex items-start gap-3 py-4 text-sm leading-7 text-muted-foreground sm:text-base"
              key={point}
            >
              <Check
                aria-hidden
                className="mt-1 size-4 shrink-0 text-foreground"
              />
              {point}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
