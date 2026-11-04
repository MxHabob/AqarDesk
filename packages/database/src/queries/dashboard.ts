import { count, eq, isNull, sql } from "drizzle-orm"
import { getDatabase, schema } from "../index"

export type RealEstateDashboardAccess = {
  properties: boolean
  listings: boolean
  owners: boolean
}

export async function getRealEstateDashboardSummary(
  access: RealEstateDashboardAccess,
  database = getDatabase()
) {
  const [propertyCount, listingCounts, ownerCount] = await Promise.all([
    access.properties
      ? database
          .select({ total: count() })
          .from(schema.properties)
          .where(isNull(schema.properties.archivedAt))
      : Promise.resolve([{ total: 0 }]),
    access.listings
      ? database
          .select({
            total: count(),
            active: count(
              sql`case when ${schema.listings.status} = 'active' then 1 end`
            ),
            draft: count(
              sql`case when ${schema.listings.status} = 'draft' then 1 end`
            ),
            sale: count(
              sql`case when ${schema.listings.status} = 'active' and ${schema.listings.type} = 'sale' then 1 end`
            ),
            rent: count(
              sql`case when ${schema.listings.status} = 'active' and ${schema.listings.type} = 'rent' then 1 end`
            ),
          })
          .from(schema.listings)
          .innerJoin(
            schema.properties,
            eq(schema.listings.propertyId, schema.properties.id)
          )
          .where(isNull(schema.properties.archivedAt))
      : Promise.resolve([{ total: 0, active: 0, draft: 0, sale: 0, rent: 0 }]),
    access.owners
      ? database
          .select({ total: count() })
          .from(schema.owners)
          .where(isNull(schema.owners.archivedAt))
      : Promise.resolve([{ total: 0 }]),
  ])

  return {
    propertyCount: propertyCount[0]?.total ?? 0,
    listingCount: listingCounts[0]?.total ?? 0,
    activeListingCount: listingCounts[0]?.active ?? 0,
    draftListingCount: listingCounts[0]?.draft ?? 0,
    saleListingCount: listingCounts[0]?.sale ?? 0,
    rentalListingCount: listingCounts[0]?.rent ?? 0,
    ownerCount: ownerCount[0]?.total ?? 0,
  }
}
