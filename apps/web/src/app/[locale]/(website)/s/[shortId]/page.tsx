import {
  getPublicListingById,
  resolveShortLink,
} from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { z } from "zod"
import { createPageMetadata } from "@/lib/marketing/metadata"
import type { AppLocale } from "@/locales/config"

type Props = {
  params: Promise<{ locale: AppLocale; shortId: string }>
}

const shortIdSchema = z.string().regex(/^[A-Za-z0-9_-]{20,50}$/)

async function getSharedListing(shortId: string) {
  if (!shortIdSchema.safeParse(shortId).success) return null
  const shortLink = await resolveShortLink(shortId)
  if (shortLink?.resourceType !== "listing") return null
  return getPublicListingById(shortLink.resourceId)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, shortId } = await params
  const listing = await getSharedListing(shortId)
  if (!listing) {
    return {
      title: "Shared listing unavailable",
      robots: { index: false, follow: false },
    }
  }

  return {
    ...createPageMetadata({
      title: listing.title,
      description:
        listing.description ??
        listing.publicNotes ??
        "View this property on AqarDesk.",
      locale,
      path: `/s/${shortId}`,
      ogImagePath: `/listings/${listing.id}/opengraph-image`,
      type: "article",
      canonical: false,
    }),
    robots: { index: false, follow: true },
  }
}

export default async function SharedListingPage({ params }: Props) {
  const { locale, shortId } = await params
  const listing = await getSharedListing(shortId)
  if (!listing) notFound()
  redirect(`/${locale}/listings/${listing.id}`)
}
