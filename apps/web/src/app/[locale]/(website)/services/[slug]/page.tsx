import { ArrowUpLeft, ArrowUpRight, MapPin } from "lucide-react"
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

type MarkdownBlock =
  | { type: "heading"; depth: number; text: string }
  | { type: "paragraph"; text: string }
  | {
      type: "list"
      ordered: boolean
      items: { heading?: string; text: string }[]
    }

function parseListItem(value?: string) {
  const text = value?.trim() ?? ""
  const heading = text.match(/^\*\*(.+?)\*\*:?\s*(.*)$/)

  return heading
    ? { heading: heading[1]?.trim(), text: heading[2]?.trim() ?? "" }
    : { text }
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks = markdown
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block) => {
    const heading = block.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      return {
        type: "heading",
        depth: heading[1]?.length ?? 1,
        text: heading[2]?.trim() ?? "",
      }
    }

    const lines = block.split(/\r?\n/)
    const unorderedItems = lines.map((line) => line.match(/^[-*]\s+(.+)$/))
    if (unorderedItems.every(Boolean)) {
      return {
        type: "list",
        ordered: false,
        items: unorderedItems.map((item) => parseListItem(item?.[1])),
      }
    }

    const orderedItems = lines.map((line) => line.match(/^\d+\.\s+(.+)$/))
    if (orderedItems.every(Boolean)) {
      return {
        type: "list",
        ordered: true,
        items: orderedItems.map((item) => parseListItem(item?.[1])),
      }
    }

    return { type: "paragraph", text: lines.join(" ").trim() }
  })
}

function MarkdownContent({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown)

  if (!blocks.length) return null

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        if (block.type === "heading") {
          const Heading = block.depth === 1 ? "h2" : "h3"
          return (
            <Heading
              className="font-serif text-2xl text-foreground sm:text-3xl"
              key={`${block.type}-${block.text}`}
            >
              {block.text}
            </Heading>
          )
        }

        if (block.type === "paragraph") {
          return (
            <p
              className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8"
              key={`${block.type}-${block.text}`}
            >
              {block.text}
            </p>
          )
        }

        const List = block.ordered ? "ol" : "ul"
        return (
          <List
            className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
            key={`list-${block.items.map((item) => item.text).join("-")}`}
          >
            {block.items.map((item) => (
              <li
                className="min-h-36 bg-background p-6 sm:p-7"
                key={`${item.heading ?? ""}-${item.text}`}
              >
                {item.heading && (
                  <h3 className="text-sm font-medium text-foreground">
                    {item.heading}
                  </h3>
                )}
                {item.text && (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                )}
              </li>
            ))}
          </List>
        )
      })}
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  setStaticParamsLocale(locale)
  const service = getMarketingService(slug)
  if (!service) notFound()

  const t = await getScopedI18n("site")
  return createPageMetadata({
    title: t(`serviceCopy.${service.copyKey}.title`),
    description: t(`serviceCopy.${service.copyKey}.description`),
    locale,
    path: `/services/${service.slug}`,
  })
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setStaticParamsLocale(locale)
  const service = getMarketingService(slug)
  if (!service) notFound()

  const t = await getScopedI18n("site")
  const queryListings = service.listingType !== null || service.propertyType
  const results = queryListings
    ? await getFilteredPublicListings({
        q: "",
        propertyType: service.propertyType ?? null,
        listingType: service.listingType,
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        sort: "newest",
        page: 1,
        pageSize: 12,
      })
    : null
  const fallbackResults =
    results?.rows.length || !service.propertyType
      ? null
      : await getFilteredPublicListings({
          q: "",
          propertyType: null,
          listingType: service.listingType,
          minPrice: null,
          maxPrice: null,
          minArea: null,
          maxArea: null,
          sort: "newest",
          page: 1,
          pageSize: 12,
        })
  const listings = results?.rows.length
    ? results.rows
    : (fallbackResults?.rows ?? results?.rows ?? [])
  const featuredListing = listings[0]
  const coverPhotos = await getPublicListingCoverPhotos(
    featuredListing ? [featuredListing.id] : []
  )
  const photo = featuredListing ? coverPhotos[featuredListing.id] : undefined
  const title = t(`serviceCopy.${service.copyKey}.title`).trim()
  const summary = t(`serviceCopy.${service.copyKey}.summary`).trim()
  const markdown = t(`serviceCopy.${service.copyKey}.details`).trim()
  const listingHref = featuredListing
    ? `/listings/${featuredListing.id}`
    : service.listingType
      ? `/listings?listingType=${service.listingType}`
      : "/listings"
  const actionLabel = featuredListing ? t("viewListing") : t("browseListings")

  return (
    <article className="mx-auto max-w-6xl py-10 sm:py-16 lg:py-20">
      {(title || summary) && (
        <header className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("servicesEyebrow")}
          </p>
          {title && (
            <h1 className="mx-auto mt-5 max-w-5xl font-serif text-5xl leading-tight text-foreground sm:text-7xl lg:text-8xl">
              {title}
            </h1>
          )}
          {summary && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {summary}
            </p>
          )}
          <Link
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            href={listingHref}
          >
            {actionLabel}
            <ArrowUpRight aria-hidden className="size-4 rtl:hidden" />
            <ArrowUpLeft aria-hidden className="hidden size-4 rtl:block" />
          </Link>
        </header>
      )}

      {featuredListing && photo && (
        <figure className="mx-auto mt-10 max-w-6xl px-4 sm:mt-14">
          <Link
            aria-label={featuredListing.title}
            className="group relative block aspect-[16/9] overflow-hidden bg-secondary"
            href={`/listings/${featuredListing.id}`}
          >
            <Image
              alt={photo.altText || featuredListing.title}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 75vw"
              src={photo.url}
              unoptimized
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-background/90 p-4 text-xs backdrop-blur-sm">
              <span className="truncate font-medium text-foreground">
                {featuredListing.title}
              </span>
              {(featuredListing.city || featuredListing.district) && (
                <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground">
                  <MapPin aria-hidden className="size-3.5" />
                  {[featuredListing.city, featuredListing.district]
                    .filter(Boolean)
                    .join("، ")}
                </span>
              )}
            </figcaption>
          </Link>
        </figure>
      )}

      {markdown && (
        <section
          aria-label={t("serviceDetails")}
          className="mx-auto max-w-5xl px-4 py-10 sm:py-16"
        >
          <MarkdownContent markdown={markdown} />
        </section>
      )}
    </article>
  )
}
