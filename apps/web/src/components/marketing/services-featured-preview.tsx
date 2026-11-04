"use client"

import { cn } from "@aqardesk/ui/cn"
import { ArrowUpRight, Building2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type FeaturedListing = {
  id: string
  title: string
  photo?: {
    url: string
    altText: string | null
  } | null
}

type CustomerQuote = {
  name: string
  title: string
  country: string
  content: string
}

function getRandomNextIndex(currentIndex: number, length: number) {
  if (length < 2) return currentIndex

  const nextIndex = Math.floor(Math.random() * (length - 1))
  return nextIndex >= currentIndex ? nextIndex + 1 : nextIndex
}

export function ServicesFeaturedPreview({
  listings,
  quotes,
  locale,
  featuredLabel,
  quotesLabel,
  demoNotice,
  className,
  onClick,
}: {
  listings: FeaturedListing[]
  quotes: CustomerQuote[]
  locale: string
  featuredLabel: string
  quotesLabel: string
  demoNotice: string
  className?: string
  onClick?: () => void
}) {
  const [listingIndex, setListingIndex] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    if (listings.length > 1) {
      setListingIndex(Math.floor(Math.random() * listings.length))
    }
    if (quotes.length > 1) {
      setQuoteIndex(Math.floor(Math.random() * quotes.length))
    }

    const interval = setInterval(() => {
      setListingIndex((index) => getRandomNextIndex(index, listings.length))
      setQuoteIndex((index) => getRandomNextIndex(index, quotes.length))
    }, 7000)

    return () => clearInterval(interval)
  }, [listings.length, quotes.length])

  const featuredListing = listings[listingIndex] ?? listings[0]
  const quote = quotes[quoteIndex] ?? quotes[0]

  return (
    <Link
      aria-label={featuredListing?.title ?? featuredLabel}
      className={cn(
        "group relative block min-h-64 overflow-hidden border-t border-border bg-background lg:min-h-full lg:border-s lg:border-t-0",
        className
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
      href={featuredListing ? `/listings/${featuredListing.id}` : "/portfolio"}
      onClick={onClick}
    >
      {featuredListing?.photo ? (
        <Image
          alt={
            featuredListing.photo.altText ||
            featuredListing.title ||
            featuredLabel
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 45vw"
          src={featuredListing.photo.url}
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

      {quote && (
        <span className="absolute inset-x-4 top-4 flex flex-col gap-3 border border-border bg-background/90 p-4 backdrop-blur-sm sm:inset-x-5 sm:top-5 sm:p-5">
          <span className="text-xs font-medium text-muted-foreground">
            {quotesLabel}
          </span>
          <span className="line-clamp-3 font-serif text-sm leading-relaxed text-foreground sm:text-base">
            &ldquo;{quote.content}&rdquo;
          </span>
          <span className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <span className="text-xs font-medium text-foreground">
              {quote.name}
              {quote.title ? ` · ${quote.title}` : ""}
              {quote.country ? ` · ${quote.country}` : ""}
            </span>
            <span className="text-[10px] leading-4 text-muted-foreground">
              {demoNotice}
            </span>
          </span>
        </span>
      )}

      {featuredListing && (
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-background/90 p-4 backdrop-blur-sm sm:p-5">
          <span>
            <span className="block text-xs text-muted-foreground">
              {featuredLabel}
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
  )
}
