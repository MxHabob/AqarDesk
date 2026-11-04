import { resolveShortLink } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import {
  getPublicListingById,
  getPublicListingCoverPhotos,
} from "@/lib/listings/public-queries"
import { createPageMetadata, getSiteUrl } from "@/lib/marketing/metadata"

type Props = {
  params: Promise<{ locale: string; shortId: string }>
}

async function getSharedListing(shortId: string) {
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

  const coverPhotos = await getPublicListingCoverPhotos([listing.id])
  const coverPhoto = coverPhotos[listing.id]

  return {
    ...(await createPageMetadata({
      title: listing.title,
      description:
        listing.description ??
        listing.publicNotes ??
        "View this property on AqarDesk.",
      locale,
      path: `/s/${shortId}`,
      ...(coverPhoto && {
        ogImageUrl: getSiteUrl(
          `/api/public/listing-images/${coverPhoto.mediaId}`
        ),
      }),
      type: "article",
      canonical: false,
    })),
    robots: { index: false, follow: true },
  }
}

export default async function SharedListingPage({ params }: Props) {
  const { locale, shortId } = await params
  const listing = await getSharedListing(shortId)
  if (!listing) notFound()
  redirect(`/${locale}/listings/${listing.id}`)
}
