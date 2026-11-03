import { and, desc, eq, gt, isNull, or } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function listUserFavorites(
  userId: string,
  database = getDatabase()
) {
  return database
    .select({
      listingId: schema.listings.id,
      listingType: schema.listings.type,
      salePrice: schema.listings.salePrice,
      monthlyRent: schema.listings.monthlyRent,
      currencyCode: schema.listings.currencyCode,
      title: schema.properties.title,
      propertyType: schema.properties.type,
      city: schema.properties.city,
      district: schema.properties.district,
      createdAt: schema.favorites.createdAt,
    })
    .from(schema.favorites)
    .innerJoin(
      schema.listings,
      eq(schema.favorites.listingId, schema.listings.id)
    )
    .innerJoin(
      schema.properties,
      eq(schema.listings.propertyId, schema.properties.id)
    )
    .where(
      and(
        eq(schema.favorites.userId, userId),
        eq(schema.listings.status, "active"),
        isNull(schema.properties.archivedAt),
        or(
          isNull(schema.listings.expiresAt),
          gt(schema.listings.expiresAt, new Date())
        )
      )
    )
    .orderBy(desc(schema.favorites.createdAt))
}

export async function isListingFavorite(
  userId: string,
  listingId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [favorite] = await database
    .select({ listingId: schema.favorites.listingId })
    .from(schema.favorites)
    .where(
      and(
        eq(schema.favorites.userId, userId),
        eq(schema.favorites.listingId, listingId)
      )
    )
    .limit(1)

  return Boolean(favorite)
}

export async function setListingFavorite(
  userId: string,
  listingId: string,
  isFavorite: boolean,
  database: DatabaseOrTransaction = getDatabase()
) {
  if (isFavorite) {
    await database
      .insert(schema.favorites)
      .values({ userId, listingId })
      .onConflictDoNothing()
    return true
  }

  await database
    .delete(schema.favorites)
    .where(
      and(
        eq(schema.favorites.userId, userId),
        eq(schema.favorites.listingId, listingId)
      )
    )

  return false
}

export async function toggleListingFavorite(
  userId: string,
  listingId: string,
  database = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [removed] = await transaction
      .delete(schema.favorites)
      .where(
        and(
          eq(schema.favorites.userId, userId),
          eq(schema.favorites.listingId, listingId)
        )
      )
      .returning({ listingId: schema.favorites.listingId })

    if (removed) return false

    await transaction
      .insert(schema.favorites)
      .values({ userId, listingId })
      .onConflictDoNothing()

    return isListingFavorite(userId, listingId, transaction)
  }, database)
}
