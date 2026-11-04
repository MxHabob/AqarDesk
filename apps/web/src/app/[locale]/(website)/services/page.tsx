import {
  ArrowUpLeft,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  DraftingCompass,
  FileText,
  Hammer,
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
  "real-estate-contracts": FileText,
  "engineering-design": DraftingCompass,
  contracting: Handshake,
  tenders: ClipboardList,
  "construction-finishing": Hammer,
}

const serviceGroups = [
  {
    id: "property",
    titleKey: "serviceGroupProperty",
    services: marketingServices.filter((service) =>
      ["sale", "rent", "investment"].includes(service.slug)
    ),
  },
  {
    id: "management",
    titleKey: "serviceGroupManagement",
    services: marketingServices.filter((service) =>
      [
        "property-management",
        "property-marketing",
        "property-consultation",
        "real-estate-contracts",
      ].includes(service.slug)
    ),
  },
  {
    id: "development",
    titleKey: "serviceGroupDevelopment",
    services: marketingServices.filter((service) =>
      [
        "engineering-design",
        "contracting",
        "tenders",
        "construction-finishing",
      ].includes(service.slug)
    ),
  },
] as const

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

  const listingIds = [
    ...new Set([
      ...listings.map((listing) => listing.id),
      ...[...listingsByService.values()]
        .filter((listing) => listing !== null)
        .map((listing) => listing.id),
    ]),
  ]
  const coverPhotos = await getPublicListingCoverPhotos(listingIds)

  return (
    <article className="mx-auto max-w-5xl py-10 sm:py-14 lg:py-16">
      <header className="border-b border-border pb-10 sm:pb-14">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-foreground">01</span>
          <span aria-hidden className="h-px w-8 bg-border" />
          <p className="font-medium text-muted-foreground">
            {t("servicesEyebrow")}
          </p>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-12">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("servicesTitle")}
          </h1>
          <div className="flex flex-col items-start gap-5">
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              {t("servicesDescription")}
            </p>
            <Link
              className="inline-flex min-h-10 items-center gap-2 border-b border-foreground pb-1 text-sm font-medium text-foreground transition-opacity hover:opacity-65"
              href="/listings"
            >
              {t("browseListings")}
              <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
              <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
            </Link>
          </div>
        </div>

        <nav
          aria-label={t("serviceSelectionTitle")}
          className="mt-10 grid border-y border-border sm:mt-12 sm:grid-cols-3 sm:divide-x sm:divide-border sm:rtl:divide-x-reverse"
        >
          {serviceGroups.map((group, index) => (
            <Link
              className="group flex items-center gap-3 border-b border-border py-4 transition-colors last:border-b-0 hover:text-muted-foreground sm:border-b-0 sm:px-4 sm:first:ps-0 sm:last:pe-0"
              href={`#services-${group.id}`}
              key={group.id}
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {t(group.titleKey)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {String(group.services.length).padStart(2, "0")}
              </span>
              <ArrowUpRight
                aria-hidden
                className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
              />
            </Link>
          ))}
        </nav>
      </header>

      <section
        aria-label={t("serviceSelectionTitle")}
        className="pt-10 sm:pt-14"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("servicesEyebrow")}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
              {t("serviceSelectionTitle")}
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground" dir="ltr">
            {String(marketingServices.length).padStart(2, "0")}
          </span>
        </div>

        <div className="space-y-12 sm:space-y-16">
          {serviceGroups.map((group, groupIndex) => (
            <section
              aria-labelledby={`services-${group.id}-title`}
              className="scroll-mt-24"
              id={`services-${group.id}`}
              key={group.id}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border" />
                <span
                  className="font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {String(group.services.length).padStart(2, "0")}
                </span>
              </div>
              <h3
                className="mb-4 font-serif text-xl text-foreground sm:text-2xl"
                id={`services-${group.id}-title`}
              >
                {t(group.titleKey)}
              </h3>
              <ol className="divide-y divide-border border-y border-border">
                {group.services.map((service) => {
                  const listing = listingsByService.get(service.slug)
                  const photo = listing ? coverPhotos[listing.id] : undefined
                  const Icon = serviceIcons[service.slug]
                  const serviceNumber = marketingServices.findIndex(
                    (item) => item.slug === service.slug
                  )

                  return (
                    <li key={service.slug}>
                      <Link
                        className="group grid items-center gap-3 py-4 transition-colors hover:bg-secondary/40 sm:grid-cols-[2.5rem_4rem_minmax(0,1fr)_auto] sm:gap-5 sm:py-5"
                        href={`/services/${service.slug}`}
                      >
                        <span
                          className="font-mono text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {String(serviceNumber + 1).padStart(2, "0")}
                        </span>
                        <span className="relative hidden size-16 overflow-hidden bg-secondary sm:block">
                          {photo ? (
                            <Image
                              alt=""
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              fill
                              sizes="64px"
                              src={photo.url}
                              unoptimized
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-muted-foreground">
                              <Icon
                                aria-hidden
                                className="size-6"
                                strokeWidth={1.4}
                              />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground">
                            {t(`serviceCopy.${service.copyKey}.cardTitle`)}
                          </span>
                          <span className="mt-1 block text-xs leading-6 text-muted-foreground sm:text-sm">
                            {t(`serviceCopy.${service.copyKey}.summary`)}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:text-sm">
                          <span className="hidden sm:inline">
                            {t("serviceDetails")}
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                          />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      </section>

      <section className="mt-12 flex flex-col gap-5 border-t border-border pt-8 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-muted-foreground">
            {t("portfolioEyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-xl text-foreground sm:text-2xl">
            {t("featuredDescription")}
          </h2>
        </div>
        <Link
          className="inline-flex min-h-10 shrink-0 items-center gap-2 border-b border-foreground pb-1 text-sm font-medium text-foreground transition-opacity hover:opacity-65"
          href="/portfolio"
        >
          {t("portfolioTitle")}
          <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </section>
    </article>
  )
}
