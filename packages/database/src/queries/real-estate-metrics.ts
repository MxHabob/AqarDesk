import { and, count, eq, gte, isNull, lte, sql } from "drizzle-orm"
import { getDatabase, schema } from "../index"

export type RealEstateMetricsAccess = {
  properties: boolean
  listings: boolean
  owners: boolean
}

export async function getRealEstateMetrics(
  input: { from: Date; to: Date; previousFrom: Date; previousTo: Date },
  access: RealEstateMetricsAccess,
  database = getDatabase()
) {
  const propertyConditions = [
    isNull(schema.properties.archivedAt),
    gte(schema.properties.createdAt, input.from),
    lte(schema.properties.createdAt, input.to),
  ]
  const listingConditions = [
    isNull(schema.properties.archivedAt),
    gte(schema.listings.createdAt, input.from),
    lte(schema.listings.createdAt, input.to),
  ]
  const previousPropertyConditions = [
    isNull(schema.properties.archivedAt),
    gte(schema.properties.createdAt, input.previousFrom),
    lte(schema.properties.createdAt, input.previousTo),
  ]
  const previousListingConditions = [
    isNull(schema.properties.archivedAt),
    gte(schema.listings.createdAt, input.previousFrom),
    lte(schema.listings.createdAt, input.previousTo),
  ]
  const propertyMonth = sql<string>`to_char(date_trunc('month', ${schema.properties.createdAt}), 'YYYY-MM')`
  const listingMonth = sql<string>`to_char(date_trunc('month', ${schema.listings.createdAt}), 'YYYY-MM')`
  const normalizedCity = sql<string>`coalesce(nullif(trim(${schema.properties.city}), ''), '—')`

  const [
    propertyTotal,
    propertiesByMonth,
    previousPropertiesByMonth,
    propertiesByType,
    previousPropertiesByType,
    propertiesByCity,
    ownershipCoverage,
    listingTotal,
    listingsByMonth,
    previousListingsByMonth,
    listingsByStatus,
    listingsByType,
    listingAssignment,
  ] = await Promise.all([
    access.properties
      ? database
          .select({ total: count() })
          .from(schema.properties)
          .where(and(...propertyConditions))
      : Promise.resolve([{ total: 0 }]),
    access.properties
      ? database
          .select({ month: propertyMonth, total: count() })
          .from(schema.properties)
          .where(and(...propertyConditions))
          .groupBy(propertyMonth)
          .orderBy(propertyMonth)
      : Promise.resolve([]),
    access.properties
      ? database
          .select({ month: propertyMonth, total: count() })
          .from(schema.properties)
          .where(and(...previousPropertyConditions))
          .groupBy(propertyMonth)
          .orderBy(propertyMonth)
      : Promise.resolve([]),
    access.properties
      ? database
          .select({ type: schema.properties.type, total: count() })
          .from(schema.properties)
          .where(and(...propertyConditions))
          .groupBy(schema.properties.type)
          .orderBy(schema.properties.type)
      : Promise.resolve([]),
    access.properties
      ? database
          .select({ type: schema.properties.type, total: count() })
          .from(schema.properties)
          .where(and(...previousPropertyConditions))
          .groupBy(schema.properties.type)
          .orderBy(schema.properties.type)
      : Promise.resolve([]),
    access.properties
      ? database
          .select({ city: normalizedCity, total: count() })
          .from(schema.properties)
          .where(and(...propertyConditions))
          .groupBy(normalizedCity)
          .orderBy(sql`count(*) desc`, normalizedCity)
          .limit(8)
      : Promise.resolve([]),
    access.properties && access.owners
      ? database
          .select({
            total: count(sql`distinct ${schema.properties.id}`),
            owned: count(
              sql`distinct case when ${schema.propertyOwners.ownerId} is not null then ${schema.properties.id} end`
            ),
          })
          .from(schema.properties)
          .leftJoin(
            schema.propertyOwners,
            eq(schema.propertyOwners.propertyId, schema.properties.id)
          )
          .where(and(...propertyConditions))
      : Promise.resolve([{ total: 0, owned: 0 }]),
    access.listings
      ? database
          .select({ total: count() })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...listingConditions))
      : Promise.resolve([{ total: 0 }]),
    access.listings
      ? database
          .select({ month: listingMonth, total: count() })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...listingConditions))
          .groupBy(listingMonth)
          .orderBy(listingMonth)
      : Promise.resolve([]),
    access.listings
      ? database
          .select({ month: listingMonth, total: count() })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...previousListingConditions))
          .groupBy(listingMonth)
          .orderBy(listingMonth)
      : Promise.resolve([]),
    access.listings
      ? database
          .select({ status: schema.listings.status, total: count() })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...listingConditions))
          .groupBy(schema.listings.status)
          .orderBy(schema.listings.status)
      : Promise.resolve([]),
    access.listings
      ? database
          .select({ type: schema.listings.type, total: count() })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...listingConditions))
          .groupBy(schema.listings.type)
          .orderBy(schema.listings.type)
      : Promise.resolve([]),
    access.listings
      ? database
          .select({
            assigned: count(
              sql`case when ${schema.listings.assignedToId} is not null then 1 end`
            ),
            unassigned: count(
              sql`case when ${schema.listings.assignedToId} is null then 1 end`
            ),
          })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(and(...listingConditions))
      : Promise.resolve([{ assigned: 0, unassigned: 0 }]),
  ])

  return {
    access,
    properties: {
      total: propertyTotal[0]?.total ?? 0,
      byMonth: propertiesByMonth,
      previousByMonth: previousPropertiesByMonth,
      byType: propertiesByType,
      previousByType: previousPropertiesByType,
      byCity: propertiesByCity,
      ownershipCoverage: ownershipCoverage[0] ?? { total: 0, owned: 0 },
    },
    listings: {
      total: listingTotal[0]?.total ?? 0,
      byMonth: listingsByMonth,
      previousByMonth: previousListingsByMonth,
      byStatus: listingsByStatus,
      byType: listingsByType,
      assignment: listingAssignment[0] ?? { assigned: 0, unassigned: 0 },
    },
  }
}
