import { eq } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import type { DatabaseOrTransaction } from "./types"

export async function getPropertyDetails(
  propertyId: string,
  propertyType: (typeof schema.properties.$inferSelect)["type"],
  database: DatabaseOrTransaction = getDatabase()
) {
  switch (propertyType) {
    case "building":
      return database.query.buildingDetails.findFirst({
        where: eq(schema.buildingDetails.propertyId, propertyId),
      })
    case "land":
      return database.query.landDetails.findFirst({
        where: eq(schema.landDetails.propertyId, propertyId),
      })
    case "house_villa":
      return database.query.houseVillaDetails.findFirst({
        where: eq(schema.houseVillaDetails.propertyId, propertyId),
      })
    case "investment":
      return database.query.investmentDetails.findFirst({
        where: eq(schema.investmentDetails.propertyId, propertyId),
      })
    case "commercial":
      return database.query.commercialDetails.findFirst({
        where: eq(schema.commercialDetails.propertyId, propertyId),
      })
    case "warehouse":
      return database.query.warehouseDetails.findFirst({
        where: eq(schema.warehouseDetails.propertyId, propertyId),
      })
    case "yard":
      return database.query.yardDetails.findFirst({
        where: eq(schema.yardDetails.propertyId, propertyId),
      })
    case "apartment":
      return database.query.apartmentDetails.findFirst({
        where: eq(schema.apartmentDetails.propertyId, propertyId),
      })
  }
}

export type PropertyDetailsInput =
  | {
      type: "building"
      propertyId: string
      values: Omit<typeof schema.buildingDetails.$inferInsert, "propertyId">
    }
  | {
      type: "land"
      propertyId: string
      values: Omit<typeof schema.landDetails.$inferInsert, "propertyId">
    }
  | {
      type: "house_villa"
      propertyId: string
      values: Omit<typeof schema.houseVillaDetails.$inferInsert, "propertyId">
    }
  | {
      type: "investment"
      propertyId: string
      values: Omit<typeof schema.investmentDetails.$inferInsert, "propertyId">
    }
  | {
      type: "commercial"
      propertyId: string
      values: Omit<typeof schema.commercialDetails.$inferInsert, "propertyId">
    }
  | {
      type: "warehouse"
      propertyId: string
      values: Omit<typeof schema.warehouseDetails.$inferInsert, "propertyId">
    }
  | {
      type: "yard"
      propertyId: string
      values: Omit<typeof schema.yardDetails.$inferInsert, "propertyId">
    }
  | {
      type: "apartment"
      propertyId: string
      values: Omit<typeof schema.apartmentDetails.$inferInsert, "propertyId">
    }

export async function savePropertyDetails(
  input: PropertyDetailsInput,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [property] = await transaction
      .select({ type: schema.properties.type })
      .from(schema.properties)
      .where(eq(schema.properties.id, input.propertyId))
      .limit(1)

    if (!property) return undefined
    if (property.type !== input.type) {
      throw new TypeError("Property details type must match the property type.")
    }

    const before = await getPropertyDetails(
      input.propertyId,
      input.type,
      transaction
    )
    let after: Awaited<ReturnType<typeof getPropertyDetails>>

    switch (input.type) {
      case "building": {
        const [details] = await transaction
          .insert(schema.buildingDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.buildingDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "land": {
        const [details] = await transaction
          .insert(schema.landDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.landDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "house_villa": {
        const [details] = await transaction
          .insert(schema.houseVillaDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.houseVillaDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "investment": {
        const [details] = await transaction
          .insert(schema.investmentDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.investmentDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "commercial": {
        const [details] = await transaction
          .insert(schema.commercialDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.commercialDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "warehouse": {
        const [details] = await transaction
          .insert(schema.warehouseDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.warehouseDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "yard": {
        const [details] = await transaction
          .insert(schema.yardDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.yardDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
      case "apartment": {
        const [details] = await transaction
          .insert(schema.apartmentDetails)
          .values({ ...input.values, propertyId: input.propertyId })
          .onConflictDoUpdate({
            target: schema.apartmentDetails.propertyId,
            set: input.values,
          })
          .returning()
        after = details
        break
      }
    }

    if (!after) {
      throw new Error("Property details save did not return a record.")
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "property.details_updated",
        entityType: "property",
        entityId: input.propertyId,
        before: before ? { ...before } : null,
        after: { ...after },
      },
      transaction
    )

    return after
  }, database)
}
