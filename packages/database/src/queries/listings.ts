import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import { normalizePagination } from "../utils/pagination"
import { escapeLikePattern } from "../utils/search"
import type { DatabaseOrTransaction } from "./types"

export type ListingSearch = {
  page?: number
  pageSize?: number
  query?: string
  propertyType?: (typeof schema.properties.$inferSelect)["type"]
  listingType?: (typeof schema.listings.$inferSelect)["type"]
  status?: (typeof schema.listings.$inferSelect)["status"]
  sortBy?: "createdAt" | "title" | "price" | "status"
  sortOrder?: "asc" | "desc"
  includeArchived?: boolean
}

export type PublicListingSearch = {
  q?: string
  propertyType?: (typeof schema.properties.$inferSelect)["type"] | null
  listingType?: (typeof schema.listings.$inferSelect)["type"] | null
  minPrice?: number | null
  maxPrice?: number | null
  minArea?: number | null
  maxArea?: number | null
  countryCode?: string
  sort?: "newest" | "price_asc" | "price_desc"
  page?: number
  pageSize?: number
}

export async function getListingById(
  id: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [listing] = await database
    .select()
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(eq(schema.listings.id, id))
    .limit(1)

  return listing
}

export async function listListings(
  filters: ListingSearch = {},
  database = getDatabase()
) {
  const { limit, offset, page, pageSize } = normalizePagination(filters)
  const query = filters.query?.trim()
  const conditions = [
    filters.includeArchived ? undefined : isNull(schema.properties.archivedAt),
    filters.propertyType
      ? eq(schema.properties.type, filters.propertyType)
      : undefined,
    filters.listingType
      ? eq(schema.listings.type, filters.listingType)
      : undefined,
    filters.status ? eq(schema.listings.status, filters.status) : undefined,
    query
      ? or(
          ilike(schema.properties.title, `%${escapeLikePattern(query)}%`),
          ilike(schema.properties.city, `%${escapeLikePattern(query)}%`),
          ilike(schema.properties.district, `%${escapeLikePattern(query)}%`),
          ilike(schema.properties.neighborhood, `%${escapeLikePattern(query)}%`)
        )
      : undefined,
  ]
  const where = and(...conditions)
  const price = sql`coalesce(${schema.listings.salePrice}, ${schema.listings.monthlyRent})`
  const sortColumn = {
    createdAt: schema.listings.createdAt,
    title: schema.properties.title,
    price,
    status: schema.listings.status,
  }[filters.sortBy ?? "createdAt"]
  const orderBy =
    filters.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn)

  const [totals, rows] = await Promise.all([
    database
      .select({ total: count() })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where),
    database
      .select({
        id: schema.listings.id,
        propertyId: schema.listings.propertyId,
        title: schema.properties.title,
        propertyType: schema.properties.type,
        listingType: schema.listings.type,
        status: schema.listings.status,
        salePrice: schema.listings.salePrice,
        monthlyRent: schema.listings.monthlyRent,
        currencyCode: schema.listings.currencyCode,
        city: schema.properties.city,
        district: schema.properties.district,
        assignedToId: schema.listings.assignedToId,
        createdAt: schema.listings.createdAt,
        updatedAt: schema.listings.updatedAt,
      })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
  ])
  const total = totals[0]?.total ?? 0

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function createListing(
  values: typeof schema.listings.$inferInsert,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [listing] = await transaction
      .insert(schema.listings)
      .values({ ...values, createdById: actor.id })
      .returning()

    if (!listing) {
      throw new Error("Listing creation did not return a record.")
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "listing.created",
        entityType: "listing",
        entityId: listing.id,
        after: { propertyId: listing.propertyId, type: listing.type },
      },
      transaction
    )

    return listing
  }, database)
}

export async function updateListing(
  id: string,
  values: Partial<
    Omit<
      typeof schema.listings.$inferInsert,
      "id" | "createdAt" | "createdById" | "propertyId"
    >
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [current] = await transaction
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.id, id))
      .limit(1)

    if (!current) return undefined

    const [listing] = await transaction
      .update(schema.listings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.listings.id, id))
      .returning()

    if (!listing) return undefined

    const priceChanged =
      current.salePrice !== listing.salePrice ||
      current.monthlyRent !== listing.monthlyRent
    const statusChanged = current.status !== listing.status

    if (priceChanged) {
      await transaction.insert(schema.listingPriceHistory).values({
        listingId: listing.id,
        salePrice: listing.salePrice,
        monthlyRent: listing.monthlyRent,
        changedById: actor.id,
      })
    }
    if (statusChanged) {
      await transaction.insert(schema.listingStatusHistory).values({
        listingId: listing.id,
        status: listing.status,
        changedById: actor.id,
      })
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "listing.updated",
        entityType: "listing",
        entityId: listing.id,
        before: {
          status: current.status,
          salePrice: current.salePrice,
          monthlyRent: current.monthlyRent,
        },
        after: {
          status: listing.status,
          salePrice: listing.salePrice,
          monthlyRent: listing.monthlyRent,
        },
      },
      transaction
    )

    return listing
  }, database)
}

export async function getPublicListingById(
  id: string,
  database = getDatabase(),
  countryCode?: string
) {
  const [listing] = await database
    .select({
      id: schema.listings.id,
      propertyId: schema.properties.id,
      listingType: schema.listings.type,
      status: schema.listings.status,
      salePrice: schema.listings.salePrice,
      monthlyRent: schema.listings.monthlyRent,
      keyMoney: schema.listings.keyMoney,
      advanceAmount: schema.listings.advanceAmount,
      currencyCode: schema.listings.currencyCode,
      leaseDurationMonths: schema.listings.leaseDurationMonths,
      publicNotes: schema.listings.publicNotes,
      publishedAt: schema.listings.publishedAt,
      expiresAt: schema.listings.expiresAt,
      title: schema.properties.title,
      description: schema.properties.description,
      propertyType: schema.properties.type,
      city: schema.properties.city,
      district: schema.properties.district,
      neighborhood: schema.properties.neighborhood,
      lotAreaM2: schema.properties.lotAreaM2,
      buildingAreaM2: schema.properties.buildingAreaM2,
      frontageM: schema.properties.frontageM,
      depthM: schema.properties.depthM,
      latitude: schema.properties.latitude,
      longitude: schema.properties.longitude,
    })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listings.id, id),
        countryCode
          ? eq(schema.properties.countryCode, countryCode)
          : undefined,
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .limit(1)

  return listing
}

export async function listPublicListings(limit = 30, database = getDatabase()) {
  const { rows } = await searchPublicListings(
    { page: 1, pageSize: limit },
    database
  )

  return rows
}

export async function listPublicListingSitemapEntries(
  database = getDatabase()
) {
  return database
    .select({
      id: schema.listings.id,
      publishedAt: schema.listings.publishedAt,
      updatedAt: schema.listings.updatedAt,
    })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(schema.listings.publishedAt), desc(schema.listings.updatedAt))
}

export async function searchPublicListings(
  filters: PublicListingSearch = {},
  database = getDatabase()
) {
  const { limit, offset, page, pageSize } = normalizePagination({
    page: filters.page,
    pageSize: filters.pageSize,
    maximumPageSize: 48,
  })
  const query = filters.q?.trim().slice(0, 200)
  const conditions = [
    filters.countryCode
      ? eq(schema.properties.countryCode, filters.countryCode)
      : undefined,
    eq(schema.listings.status, "active"),
    isNull(schema.properties.archivedAt),
    or(
      isNull(schema.listings.expiresAt),
      gt(schema.listings.expiresAt, new Date())
    ),
  ]

  if (query) {
    const pattern = `%${escapeLikePattern(query)}%`
    conditions.push(
      or(
        ilike(schema.properties.title, pattern),
        ilike(schema.properties.city, pattern),
        ilike(schema.properties.district, pattern),
        ilike(schema.properties.neighborhood, pattern)
      )
    )
  }
  if (filters.propertyType) {
    conditions.push(eq(schema.properties.type, filters.propertyType))
  }
  if (filters.listingType) {
    conditions.push(eq(schema.listings.type, filters.listingType))
  }

  const price = sql`coalesce(${schema.listings.salePrice}, ${schema.listings.monthlyRent})`
  const minPrice = validNonnegativeNumber(filters.minPrice)
  const maxPrice = validNonnegativeNumber(filters.maxPrice)
  const minArea = validNonnegativeNumber(filters.minArea)
  const maxArea = validNonnegativeNumber(filters.maxArea)
  if (minPrice !== null) conditions.push(gte(price, String(minPrice)))
  if (maxPrice !== null) conditions.push(lte(price, String(maxPrice)))
  if (minArea !== null) {
    conditions.push(gte(schema.properties.lotAreaM2, String(minArea)))
  }
  if (maxArea !== null) {
    conditions.push(lte(schema.properties.lotAreaM2, String(maxArea)))
  }

  const where = and(...conditions)
  const orderBy =
    filters.sort === "price_asc"
      ? asc(price)
      : filters.sort === "price_desc"
        ? desc(price)
        : desc(schema.listings.createdAt)

  const [rows, countRows] = await Promise.all([
    database
      .select({
        id: schema.listings.id,
        type: schema.listings.type,
        salePrice: schema.listings.salePrice,
        monthlyRent: schema.listings.monthlyRent,
        currencyCode: schema.listings.currencyCode,
        title: schema.properties.title,
        propertyType: schema.properties.type,
        city: schema.properties.city,
        district: schema.properties.district,
        lotAreaM2: schema.properties.lotAreaM2,
        buildingAreaM2: schema.properties.buildingAreaM2,
      })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    database
      .select({ total: count() })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where),
  ])
  const total = countRows[0]?.total ?? 0

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getShareableListingById(
  id: string,
  database = getDatabase()
) {
  const [listing] = await database
    .select({
      id: schema.listings.id,
      propertyId: schema.properties.id,
      listingType: schema.listings.type,
      status: schema.listings.status,
      salePrice: schema.listings.salePrice,
      monthlyRent: schema.listings.monthlyRent,
      keyMoney: schema.listings.keyMoney,
      advanceAmount: schema.listings.advanceAmount,
      currencyCode: schema.listings.currencyCode,
      leaseDurationMonths: schema.listings.leaseDurationMonths,
      publicNotes: schema.listings.publicNotes,
      publishedAt: schema.listings.publishedAt,
      expiresAt: schema.listings.expiresAt,
      title: schema.properties.title,
      description: schema.properties.description,
      propertyType: schema.properties.type,
      city: schema.properties.city,
      district: schema.properties.district,
      neighborhood: schema.properties.neighborhood,
      lotAreaM2: schema.properties.lotAreaM2,
      buildingAreaM2: schema.properties.buildingAreaM2,
      frontageM: schema.properties.frontageM,
      depthM: schema.properties.depthM,
      latitude: schema.properties.latitude,
      longitude: schema.properties.longitude,
    })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listings.id, id),
        isNull(schema.properties.archivedAt),
        or(
          eq(schema.listings.status, "active"),
          eq(schema.listings.status, "draft")
        ),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .limit(1)

  return listing
}

export async function getListingMetrics(database = getDatabase()) {
  const [all, active, sale, rent] = await Promise.all([
    database.select({ total: count() }).from(schema.listings),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.status, "active")),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.type, "sale")),
    database
      .select({ total: count() })
      .from(schema.listings)
      .where(eq(schema.listings.type, "rent")),
  ])

  return {
    all: all[0]?.total ?? 0,
    active: active[0]?.total ?? 0,
    sale: sale[0]?.total ?? 0,
    rent: rent[0]?.total ?? 0,
  }
}

export async function listListingHistory(
  listingId: string,
  database = getDatabase()
) {
  const [prices, statuses] = await Promise.all([
    database
      .select()
      .from(schema.listingPriceHistory)
      .where(eq(schema.listingPriceHistory.listingId, listingId))
      .orderBy(desc(schema.listingPriceHistory.changedAt)),
    database
      .select()
      .from(schema.listingStatusHistory)
      .where(eq(schema.listingStatusHistory.listingId, listingId))
      .orderBy(desc(schema.listingStatusHistory.changedAt)),
  ])

  return { prices, statuses }
}

function validNonnegativeNumber(value: number | null | undefined) {
  return value !== undefined &&
    value !== null &&
    Number.isFinite(value) &&
    value >= 0
    ? value
    : null
}
