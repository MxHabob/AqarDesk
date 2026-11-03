import { and, desc, eq, ilike, isNull, or } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import { normalizePagination } from "../utils/pagination"
import { escapeLikePattern } from "../utils/search"
import type { DatabaseOrTransaction } from "./types"

export async function getPropertyById(
  id: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [property] = await database
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.id, id))
    .limit(1)

  return property
}

export async function listProperties(
  options: {
    page?: number
    pageSize?: number
    query?: string
    type?: (typeof schema.properties.$inferSelect)["type"]
    includeArchived?: boolean
  } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)
  const query = options.query?.trim()

  return database
    .select({
      id: schema.properties.id,
      type: schema.properties.type,
      title: schema.properties.title,
      city: schema.properties.city,
      district: schema.properties.district,
      neighborhood: schema.properties.neighborhood,
      lotAreaM2: schema.properties.lotAreaM2,
      buildingAreaM2: schema.properties.buildingAreaM2,
      archivedAt: schema.properties.archivedAt,
      createdAt: schema.properties.createdAt,
      updatedAt: schema.properties.updatedAt,
    })
    .from(schema.properties)
    .where(
      and(
        options.includeArchived
          ? undefined
          : isNull(schema.properties.archivedAt),
        options.type ? eq(schema.properties.type, options.type) : undefined,
        query
          ? or(
              ilike(schema.properties.title, `%${escapeLikePattern(query)}%`),
              ilike(schema.properties.city, `%${escapeLikePattern(query)}%`),
              ilike(
                schema.properties.district,
                `%${escapeLikePattern(query)}%`
              ),
              ilike(
                schema.properties.neighborhood,
                `%${escapeLikePattern(query)}%`
              )
            )
          : undefined
      )
    )
    .orderBy(desc(schema.properties.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function createProperty(
  values: typeof schema.properties.$inferInsert,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [property] = await transaction
      .insert(schema.properties)
      .values(values)
      .returning()

    if (property) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "property.created",
          entityType: "property",
          entityId: property.id,
          after: { title: property.title, type: property.type },
        },
        transaction
      )
    }

    return property
  }, database)
}

export async function updateProperty(
  id: string,
  values: Partial<
    Omit<
      typeof schema.properties.$inferInsert,
      "id" | "createdAt" | "createdById"
    >
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        title: schema.properties.title,
        type: schema.properties.type,
        city: schema.properties.city,
        district: schema.properties.district,
        archivedAt: schema.properties.archivedAt,
      })
      .from(schema.properties)
      .where(eq(schema.properties.id, id))
      .limit(1)
    if (!before) return undefined

    const [property] = await transaction
      .update(schema.properties)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.properties.id, id))
      .returning()

    if (property) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "property.updated",
          entityType: "property",
          entityId: id,
          before,
          after: {
            title: property.title,
            type: property.type,
            city: property.city,
            district: property.district,
            archivedAt: property.archivedAt,
          },
        },
        transaction
      )
    }

    return property
  }, database)
}

export async function setPropertyOwners(
  propertyId: string,
  owners: Array<{ ownerId: string; ownershipSharePercent?: string | null }>,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const previous = await transaction
      .select({
        ownerId: schema.propertyOwners.ownerId,
        ownershipSharePercent: schema.propertyOwners.ownershipSharePercent,
      })
      .from(schema.propertyOwners)
      .where(eq(schema.propertyOwners.propertyId, propertyId))

    await transaction
      .delete(schema.propertyOwners)
      .where(eq(schema.propertyOwners.propertyId, propertyId))
    if (owners.length > 0) {
      await transaction.insert(schema.propertyOwners).values(
        owners.map((owner) => ({
          ...owner,
          propertyId,
        }))
      )
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "property.owners_updated",
        entityType: "property",
        entityId: propertyId,
        before: { owners: previous },
        after: { owners },
      },
      transaction
    )
  }, database)
}

export async function archiveProperty(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return updateProperty(id, { archivedAt: new Date() }, actor, database)
}
