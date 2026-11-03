import { getDatabase, schema } from "@aqardesk/database"
import {
  getPublicListingById,
  listPublicListings,
  type PublicListingSearch,
  searchPublicListings,
} from "@aqardesk/database/queries"
import { createReadUrl } from "@aqardesk/storage/server"
import { and, asc, desc, eq, gt, inArray, isNull, or } from "drizzle-orm"
import type { PublicListingSearchParams } from "./public-search-loader"

export { getPublicListingById, listPublicListings as getPublicListings }

export async function getPublicListingCoverPhotos(listingIds: string[]) {
  if (listingIds.length === 0) return {}

  const rows = await getDatabase()
    .select({
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
      altText: string | null
      contentType: string | null
    }
  >()
  for (const row of rows) {
    if (!coverPhotos.has(row.listingId)) {
      coverPhotos.set(row.listingId, {
        objectKey: row.objectKey,
        altText: row.altText,
        contentType: row.contentType,
      })
    }
  }

  const signedPhotos = await Promise.all(
    [...coverPhotos].map(async ([listingId, photo]) => {
      const { url } = await createReadUrl(photo.objectKey)
      return [
        listingId,
        { url, altText: photo.altText, contentType: photo.contentType },
      ] as const
    })
  )

  return Object.fromEntries(signedPhotos)
}

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
      const { url } = await createReadUrl(objectKey)
      return { ...media, url }
    })
  )
}

export function getFilteredPublicListings(filters: PublicListingSearchParams) {
  const pageSize = [12, 24, 48].includes(filters.pageSize)
    ? filters.pageSize
    : 12

  return searchPublicListings({
    ...toPublicListingSearch(filters),
    pageSize,
  })
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
