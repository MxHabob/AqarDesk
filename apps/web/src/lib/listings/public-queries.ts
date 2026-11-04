import { getDatabase, schema } from "@aqardesk/database"
import {
  getPublicListingById as getPublicListingByIdQuery,
  type PublicListingSearch,
  searchPublicListings,
} from "@aqardesk/database/queries"
import { createReadUrl } from "@aqardesk/storage/server"
import { and, asc, desc, eq, gt, inArray, isNull, or } from "drizzle-orm"
import { cookies } from "next/headers"
import { cache } from "react"
import { isWebsiteCountryCode } from "@/lib/countries"
import type { PublicListingSearchParams } from "./public-search-loader"

const countryCookieName = "Next-Country"

async function getPublicPhotoUrl(
  mediaId: string,
  objectKey: string,
  contentType: string | null
) {
  if (
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL &&
    ["image/avif", "image/jpeg", "image/png", "image/webp"].includes(
      contentType ?? ""
    )
  ) {
    return `/api/public/listing-images/${mediaId}`
  }

  const { url } = await createReadUrl(objectKey)
  return url
}

export const getSelectedPublicCountryCode = cache(async () => {
  const cookieStore = await cookies()
  const selectedCountry = cookieStore.get(countryCookieName)?.value
  if (isWebsiteCountryCode(selectedCountry)) return selectedCountry

  return "YE"
})

export async function getPublicListingById(id: string) {
  const countryCode = await getSelectedPublicCountryCode()
  return getPublicListingByIdQuery(id, undefined, countryCode)
}

export async function getPublicListings(limit = 30) {
  const countryCode = await getSelectedPublicCountryCode()
  const { rows } = await searchPublicListings({
    page: 1,
    pageSize: limit,
    countryCode,
  })
  return rows
}

export async function getPublicListingCoverPhotos(listingIds: string[]) {
  if (listingIds.length === 0) return {}

  const rows = await getDatabase()
    .select({
      mediaId: schema.listingMedia.id,
      listingId: schema.listingMedia.listingId,
      objectKey: schema.listingMedia.objectKey,
      altText: schema.listingMedia.altText,
      contentType: schema.listingMedia.contentType,
      isPrimary: schema.listingMedia.isPrimary,
    })
    .from(schema.listingMedia)
    .innerJoin(
      schema.listings,
      eq(schema.listingMedia.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        inArray(schema.listingMedia.listingId, listingIds),
        eq(schema.listingMedia.type, "photo"),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(
      desc(schema.listingMedia.isPrimary),
      asc(schema.listingMedia.position)
    )

  const coverPhotos = new Map<
    string,
    {
      objectKey: string
      mediaId: string
      altText: string | null
      contentType: string | null
    }
  >()
  for (const row of rows) {
    if (!coverPhotos.has(row.listingId)) {
      coverPhotos.set(row.listingId, {
        objectKey: row.objectKey,
        mediaId: row.mediaId,
        altText: row.altText,
        contentType: row.contentType,
      })
    }
  }

  const signedPhotos = await Promise.all(
    [...coverPhotos].map(async ([listingId, photo]) => {
      const url = await getPublicPhotoUrl(
        photo.mediaId,
        photo.objectKey,
        photo.contentType
      )
      return [
        listingId,
        {
          url,
          mediaId: photo.mediaId,
          altText: photo.altText,
          contentType: photo.contentType,
        },
      ] as const
    })
  )

  return Object.fromEntries(signedPhotos)
}

export async function getPublicListingPhotos(listingIds: string[]) {
  if (listingIds.length === 0) return {}

  const rows = await getDatabase()
    .select({
      listingId: schema.listingMedia.listingId,
      mediaId: schema.listingMedia.id,
      objectKey: schema.listingMedia.objectKey,
      altText: schema.listingMedia.altText,
      contentType: schema.listingMedia.contentType,
      isPrimary: schema.listingMedia.isPrimary,
      position: schema.listingMedia.position,
    })
    .from(schema.listingMedia)
    .innerJoin(
      schema.listings,
      eq(schema.listingMedia.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        inArray(schema.listingMedia.listingId, listingIds),
        eq(schema.listingMedia.type, "photo"),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(
      asc(schema.listingMedia.listingId),
      desc(schema.listingMedia.isPrimary),
      asc(schema.listingMedia.position)
    )

  const signedPhotos = await Promise.all(
    rows.map(
      async ({ listingId, mediaId, objectKey, altText, contentType }) => {
        const url = await getPublicPhotoUrl(mediaId, objectKey, contentType)
        return { listingId, photo: { url, altText } }
      }
    )
  )

  return signedPhotos.reduce<
    Record<string, Array<{ url: string; altText: string | null }>>
  >((galleries, { listingId, photo }) => {
    galleries[listingId] ??= []
    galleries[listingId].push(photo)
    return galleries
  }, {})
}

export const getPublicHomepageData = cache(async () => {
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

  return { results, coverPhotos }
})

export async function getPublicListingMedia(listingId: string) {
  const rows = await getDatabase()
    .select({
      id: schema.listingMedia.id,
      type: schema.listingMedia.type,
      objectKey: schema.listingMedia.objectKey,
      contentType: schema.listingMedia.contentType,
      altText: schema.listingMedia.altText,
      position: schema.listingMedia.position,
      isPrimary: schema.listingMedia.isPrimary,
    })
    .from(schema.listingMedia)
    .innerJoin(
      schema.listings,
      eq(schema.listingMedia.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listingMedia.listingId, listingId),
        inArray(schema.listingMedia.type, ["photo", "floor_plan", "video"]),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(asc(schema.listingMedia.position))

  return Promise.all(
    rows.map(async ({ objectKey, ...media }) => {
      const url =
        media.type === "photo"
          ? await getPublicPhotoUrl(media.id, objectKey, media.contentType)
          : (await createReadUrl(objectKey)).url
      return { ...media, url }
    })
  )
}

export async function getFilteredPublicListings(
  filters: PublicListingSearchParams
) {
  const pageSize = [12, 24, 48].includes(filters.pageSize)
    ? filters.pageSize
    : 12

  const countryCode = await getSelectedPublicCountryCode()
  return searchPublicListings({
    ...toPublicListingSearch(filters),
    pageSize,
    countryCode,
  })
}

export async function getSimilarPublicListings(listing: {
  id: string
  propertyType: PublicListingSearchParams["propertyType"]
  listingType: NonNullable<PublicListingSearchParams["listingType"]>
}) {
  if (!listing.propertyType) return []

  const countryCode = await getSelectedPublicCountryCode()
  const matchingListings = await searchPublicListings({
    propertyType: listing.propertyType,
    listingType: listing.listingType,
    page: 1,
    pageSize: 8,
    countryCode,
  })
  const matches = matchingListings.rows.filter(
    (candidate) => candidate.id !== listing.id
  )

  if (matches.length >= 4) return matches.slice(0, 4)

  const otherListings = await searchPublicListings({
    propertyType: listing.propertyType,
    page: 1,
    pageSize: 8,
    countryCode,
  })
  const seenIds = new Set(matches.map((candidate) => candidate.id))
  const samePropertyType = otherListings.rows.filter(
    (candidate) => candidate.id !== listing.id && !seenIds.has(candidate.id)
  )
  const recommendations = [...matches, ...samePropertyType].slice(0, 4)

  if (recommendations.length >= 4) return recommendations

  const sameListingType = await searchPublicListings({
    listingType: listing.listingType,
    page: 1,
    pageSize: 8,
    countryCode,
  })
  const includedIds = new Set(recommendations.map((candidate) => candidate.id))

  return [
    ...recommendations,
    ...sameListingType.rows.filter(
      (candidate) =>
        candidate.id !== listing.id && !includedIds.has(candidate.id)
    ),
  ].slice(0, 4)
}

function toPublicListingSearch(
  filters: PublicListingSearchParams
): PublicListingSearch {
  return {
    q: filters.q,
    propertyType: filters.propertyType,
    listingType: filters.listingType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minArea: filters.minArea,
    maxArea: filters.maxArea,
    sort: filters.sort,
    page: filters.page,
    pageSize: filters.pageSize,
  }
}
