import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
} from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import { normalizePagination } from "../utils/pagination"
import { escapeLikePattern } from "../utils/search"
import type { DatabaseOrTransaction } from "./types"

export async function getOwnerById(
  id: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [owner] = await database
    .select()
    .from(schema.owners)
    .where(eq(schema.owners.id, id))
    .limit(1)

  return owner
}

export async function listOwners(
  options: { page?: number; pageSize?: number; query?: string } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)
  const query = options.query?.trim()

  return database
    .select({
      id: schema.owners.id,
      name: schema.owners.name,
      offerTypes: schema.owners.offerTypes,
      buildingType: schema.owners.buildingType,
      city: schema.owners.city,
      district: schema.owners.district,
      neighborhood: schema.owners.neighborhood,
      street: schema.owners.street,
      contactViaOffice: schema.owners.contactViaOffice,
      notes: schema.owners.notes,
      createdById: schema.owners.createdById,
      createdAt: schema.owners.createdAt,
      updatedAt: schema.owners.updatedAt,
      archivedAt: schema.owners.archivedAt,
    })
    .from(schema.owners)
    .where(
      and(
        isNull(schema.owners.archivedAt),
        query
          ? ilike(schema.owners.name, `%${escapeLikePattern(query)}%`)
          : undefined
      )
    )
    .orderBy(asc(schema.owners.name))
    .limit(limit)
    .offset(offset)
}

export async function listArchivedOwners(
  options: { page?: number; pageSize?: number; query?: string } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)
  const query = options.query?.trim()
  const where = and(
    isNotNull(schema.owners.archivedAt),
    query
      ? ilike(schema.owners.name, `%${escapeLikePattern(query)}%`)
      : undefined
  )
  const [totalRows, rows] = await Promise.all([
    database.select({ total: count() }).from(schema.owners).where(where),
    database
      .select({
        id: schema.owners.id,
        name: schema.owners.name,
        notes: schema.owners.notes,
        archivedAt: schema.owners.archivedAt,
      })
      .from(schema.owners)
      .where(where)
      .orderBy(desc(schema.owners.archivedAt))
      .limit(limit)
      .offset(offset),
  ])
  return { rows, total: totalRows[0]?.total ?? 0 }
}

export async function createOwner(
  values: typeof schema.owners.$inferInsert,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [owner] = await transaction
      .insert(schema.owners)
      .values(values)
      .returning()

    if (owner) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "owner.created",
          entityType: "owner",
          entityId: owner.id,
          after: { name: owner.name },
        },
        transaction
      )
    }

    return owner
  }, database)
}

export async function updateOwner(
  id: string,
  values: Partial<
    Pick<
      typeof schema.owners.$inferInsert,
      | "name"
      | "offerTypes"
      | "buildingType"
      | "city"
      | "district"
      | "neighborhood"
      | "street"
      | "contactViaOffice"
      | "notes"
      | "archivedAt"
    >
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        name: schema.owners.name,
        archivedAt: schema.owners.archivedAt,
      })
      .from(schema.owners)
      .where(eq(schema.owners.id, id))
      .limit(1)
    if (!before) return undefined

    const [owner] = await transaction
      .update(schema.owners)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.owners.id, id))
      .returning()

    if (owner) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action:
            values.archivedAt === undefined
              ? "owner.updated"
              : values.archivedAt
                ? "owner.archived"
                : "owner.restored",
          entityType: "owner",
          entityId: id,
          before,
          after: { name: owner.name, archivedAt: owner.archivedAt },
        },
        transaction
      )
    }

    return owner
  }, database)
}

export async function setOwnerPhones(
  ownerId: string,
  phones: Array<{
    phoneNumber: string
    label?: string | null
    isWhatsapp?: boolean
  }>,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const previous = await transaction
      .select({
        phoneNumber: schema.ownerPhones.phoneNumber,
        label: schema.ownerPhones.label,
        isWhatsapp: schema.ownerPhones.isWhatsapp,
      })
      .from(schema.ownerPhones)
      .where(eq(schema.ownerPhones.ownerId, ownerId))

    await transaction
      .delete(schema.ownerPhones)
      .where(eq(schema.ownerPhones.ownerId, ownerId))
    if (phones.length > 0) {
      await transaction.insert(schema.ownerPhones).values(
        phones.map((phone) => ({
          ...phone,
          ownerId,
        }))
      )
    }

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "owner.phones_updated",
        entityType: "owner",
        entityId: ownerId,
        before: { phones: previous },
        after: { phones },
      },
      transaction
    )
  }, database)
}

export async function deleteOwner(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [owner] = await transaction
      .select({ id: schema.owners.id, name: schema.owners.name })
      .from(schema.owners)
      .where(eq(schema.owners.id, id))
      .limit(1)
    if (!owner) return { deleted: false as const, reason: "not_found" as const }

    const [property] = await transaction
      .select({ propertyId: schema.propertyOwners.propertyId })
      .from(schema.propertyOwners)
      .where(eq(schema.propertyOwners.ownerId, id))
      .limit(1)
    if (property) {
      return {
        deleted: false as const,
        reason: "has_properties" as const,
      }
    }

    await transaction.delete(schema.owners).where(eq(schema.owners.id, id))
    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "owner.deleted",
        entityType: "owner",
        entityId: id,
        before: owner,
      },
      transaction
    )

    return { deleted: true as const }
  }, database)
}

export async function restoreOwner(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return updateOwner(id, { archivedAt: null }, actor, database)
}
