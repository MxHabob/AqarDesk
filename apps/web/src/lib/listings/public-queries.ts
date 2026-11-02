import { getDatabase, schema } from "@aqardesk/database"
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
import type { PublicListingSearchParams } from "./public-search-loader"

export async function getPublicListings(limit = 30) {
  const database = getDatabase()

  return database
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
    .orderBy(desc(schema.listings.createdAt))
    .limit(limit)
}

export async function getPublicListingById(id: string) {
  const database = getDatabase()
  const [listing] = await database
    .select({
      id: schema.listings.id,
      type: schema.listings.type,
      salePrice: schema.listings.salePrice,
      monthlyRent: schema.listings.monthlyRent,
      currencyCode: schema.listings.currencyCode,
      publicNotes: schema.listings.publicNotes,
      title: schema.properties.title,
      description: schema.properties.description,
      propertyType: schema.properties.type,
      city: schema.properties.city,
      district: schema.properties.district,
      neighborhood: schema.properties.neighborhood,
      lotAreaM2: schema.properties.lotAreaM2,
    })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.listings.id, id),
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

export async function getFilteredPublicListings(
  filters: PublicListingSearchParams
) {
  const database = getDatabase()
  const page = Math.min(Math.max(1, filters.page), 10_000)
  const pageSize = [12, 24, 48].includes(filters.pageSize)
    ? filters.pageSize
    : 12
  const query = filters.q.trim().slice(0, 200)
  const conditions = [
    eq(schema.listings.status, "active"),
    isNull(schema.properties.archivedAt),
    or(
      isNull(schema.listings.expiresAt),
      gt(schema.listings.expiresAt, new Date())
    ),
  ]

  if (query) {
    const escapedQuery = query.replace(/[\\%_]/g, "\\$&")
    const searchPattern = `%${escapedQuery}%`
    conditions.push(
      or(
        ilike(schema.properties.title, searchPattern),
        ilike(schema.properties.city, searchPattern),
        ilike(schema.properties.district, searchPattern),
        ilike(schema.properties.neighborhood, searchPattern)
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

  const minPrice =
    filters.minPrice !== null &&
    Number.isFinite(filters.minPrice) &&
    filters.minPrice >= 0
      ? filters.minPrice
      : null
  const maxPrice =
    filters.maxPrice !== null &&
    Number.isFinite(filters.maxPrice) &&
    filters.maxPrice >= 0
      ? filters.maxPrice
      : null
  const minArea =
    filters.minArea !== null &&
    Number.isFinite(filters.minArea) &&
    filters.minArea >= 0
      ? filters.minArea
      : null
  const maxArea =
    filters.maxArea !== null &&
    Number.isFinite(filters.maxArea) &&
    filters.maxArea >= 0
      ? filters.maxArea
      : null

  if (minPrice !== null) {
    conditions.push(gte(price, String(minPrice)))
  }
  if (maxPrice !== null) {
    conditions.push(lte(price, String(maxPrice)))
  }
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

  const [rows, totals] = await Promise.all([
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
      })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    database
      .select({ total: count() })
      .from(schema.listings)
      .innerJoin(
        schema.properties,
        eq(schema.listings.propertyId, schema.properties.id)
      )
      .where(where),
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
