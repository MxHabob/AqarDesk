"use client"

import { cn } from "@aqardesk/ui/cn"
import { ArrowUpRight, Building2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

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

  if (currentIndex < 0) return Math.floor(Math.random() * length)

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
  isOpen,
}: {
  listings: FeaturedListing[]
  quotes: CustomerQuote[]
  locale: string
  featuredLabel: string
  quotesLabel: string
  demoNotice: string
  className?: string
  onClick?: () => void
  isOpen?: boolean
}) {
  const [listingIndex, setListingIndex] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const lastListingIndexRef = useRef(-1)
  const lastQuoteIndexRef = useRef(-1)

  useEffect(() => {
    if (isOpen !== undefined) {
      if (!isOpen) return

      const nextListingIndex = getRandomNextIndex(
        lastListingIndexRef.current,
        listings.length
      )
      const nextQuoteIndex =
        quotes.length > 0 ? (lastQuoteIndexRef.current + 1) % quotes.length : 0

      lastListingIndexRef.current = nextListingIndex
      lastQuoteIndexRef.current = nextQuoteIndex
      setListingIndex(nextListingIndex)
      setQuoteIndex(nextQuoteIndex)
      return
    }

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
  }, [isOpen, listings.length, quotes.length])

  const featuredListing = listings[listingIndex] ?? listings[0]
  const quote = quotes[quoteIndex] ?? quotes[0]

  return (
    <Link
      aria-label={featuredListing?.title ?? featuredLabel}
      className={cn(
        "group relative flex min-h-64 flex-col overflow-hidden border border-border bg-background transition-all duration-200 hover:scale-[1.02] hover:border-foreground/20 hover:opacity-90 lg:min-h-full",
        className
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
      href={featuredListing ? `/listings/${featuredListing.id}` : "/portfolio"}
      onClick={onClick}
    >
      <span className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
        {featuredListing?.photo ? (
          <Image
            alt={
              featuredListing.photo.altText ||
              featuredListing.title ||
              featuredLabel
            }
            className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.03]"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 45vw"
            src={featuredListing.photo.url}
            unoptimized
          />
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-[size:16px_16px]" />
        )}
        <span aria-hidden className="absolute inset-0 bg-background/60" />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[78%] z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[12rem] leading-none text-foreground opacity-[0.08]"
        >
          &rdquo;
        </span>
        {quote && (
          <span className="relative z-10 flex w-full max-w-md flex-col items-center">
            <span className="mb-3 text-xs text-muted-foreground">
              {quotesLabel}
            </span>
            <span className="line-clamp-3 font-serif text-sm leading-tight text-foreground xl:text-base">
              &ldquo;{quote.content}&rdquo;
            </span>
            <span className="mt-3 text-xs text-foreground">
              {quote.name}
              {quote.title ? ` · ${quote.title}` : ""}
              {quote.country ? ` · ${quote.country}` : ""}
            </span>
            <span className="mt-2 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
              {demoNotice}
            </span>
          </span>
        )}
        {!featuredListing && (
          <Building2
            aria-hidden
            className="absolute bottom-3 end-3 size-5 text-muted-foreground"
            strokeWidth={1}
          />
        )}
      </span>

      <span className="flex items-center justify-between gap-4 border-t border-border bg-background p-2.5">
        <span className="min-w-0 flex-1">
          <span className="block font-sans text-xs text-foreground">
            {featuredLabel}
          </span>
          <span className="block truncate font-sans text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
            {featuredListing?.title ?? quotesLabel}
          </span>
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-foreground rtl:-scale-x-100"
        />
      </span>
    </Link>
  )
}
