import { listPublicListingSitemapEntries } from "@aqardesk/database/queries"
import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/marketing/metadata"
import { locales } from "@/locales/config"

export const revalidate = 3600

const publicPaths = [
  "",
  "/about",
  "/listings",
  "/terms",
  "/policy",
  "/testimonials",
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await listPublicListingSitemapEntries()
  const pages = publicPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: getSiteUrl(`/${locale}${path}`),
      alternates: {
        languages: {
          ar: getSiteUrl(`/ar${path}`),
          en: getSiteUrl(`/en${path}`),
        },
      },
    }))
  )
  const listingPages = listings.flatMap((listing) =>
    locales.map((locale) => ({
      url: getSiteUrl(`/${locale}/listings/${listing.id}`),
      lastModified: listing.publishedAt ?? listing.updatedAt,
      alternates: {
        languages: {
          ar: getSiteUrl(`/ar/listings/${listing.id}`),
          en: getSiteUrl(`/en/listings/${listing.id}`),
        },
      },
    }))
  )

  return [...pages, ...listingPages]
}
