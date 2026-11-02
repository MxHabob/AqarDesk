import { getDatabase, schema } from "@aqardesk/database"
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import type { ListingQuery } from "./schema"

export async function getListingRows(filters: ListingQuery) {
  const database = getDatabase()
  const conditions = [
    filters.propertyType
      ? eq(schema.properties.type, filters.propertyType)
      : undefined,
    filters.listingType
      ? eq(schema.listings.type, filters.listingType)
      : undefined,
    filters.status ? eq(schema.listings.status, filters.status) : undefined,
    filters.query
      ? or(
          ilike(schema.properties.title, `%${filters.query}%`),
          ilike(schema.properties.city, `%${filters.query}%`),
          ilike(schema.properties.district, `%${filters.query}%`),
          ilike(schema.properties.neighborhood, `%${filters.query}%`)
        )
      : undefined,
  ].filter((condition) => condition !== undefined)
  const where = conditions.length ? and(...conditions) : undefined
  const sortDirection = filters.sortOrder === "asc" ? asc : desc
  const sortColumn = {
    createdAt: schema.listings.createdAt,
    title: schema.properties.title,
    price: sql`coalesce(${schema.listings.salePrice}, ${schema.listings.monthlyRent})`,
    status: schema.listings.status,
  }[filters.sortBy]
  const [countRow] = await database
    .select({ total: count() })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(where)

  const rows = await database
    .select({
      id: schema.listings.id,
      title: schema.properties.title,
      propertyType: schema.properties.type,
      listingType: schema.listings.type,
      status: schema.listings.status,
      salePrice: schema.listings.salePrice,
      monthlyRent: schema.listings.monthlyRent,
      currencyCode: schema.listings.currencyCode,
      city: schema.properties.city,
      district: schema.properties.district,
      createdAt: schema.listings.createdAt,
    })
    .from(schema.listings)
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(where)
    .orderBy(sortDirection(sortColumn))
    .limit(filters.pageSize)
    .offset((filters.page - 1) * filters.pageSize)

  return {
    rows: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    total: countRow?.total ?? 0,
  }
}

export async function getListingMetrics() {
  const database = getDatabase()
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
