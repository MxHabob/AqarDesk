import { count, desc, eq, ilike, lt, or } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { writeAuditLog } from "../utils/audit-log"
import { withTransaction } from "../utils/database"
import { normalizePagination } from "../utils/pagination"
import { escapeLikePattern } from "../utils/search"
import type { Database, DatabaseOrTransaction } from "./types"

export async function getUserById(
  id: string,
  database: Database = getDatabase()
) {
  const [user] = await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      emailVerified: schema.users.emailVerified,
      image: schema.users.image,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1)

  return user
}

export async function getUserByEmail(
  email: string,
  database: Database = getDatabase()
) {
  const [user] = await database
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      emailVerified: schema.users.emailVerified,
      image: schema.users.image,
      createdAt: schema.users.createdAt,
      updatedAt: schema.users.updatedAt,
    })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1)

  return user
}

export async function listUsers(
  options: { page?: number; pageSize?: number; query?: string } = {},
  database: Database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)
  const query = options.query?.trim()
  const where = query
    ? or(
        ilike(schema.users.name, `%${escapeLikePattern(query)}%`),
        ilike(schema.users.email, `%${escapeLikePattern(query)}%`)
      )
    : undefined
  const [totalRows, rows] = await Promise.all([
    database.select({ total: count() }).from(schema.users).where(where),
    database
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        image: schema.users.image,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(where)
      .orderBy(desc(schema.users.createdAt))
      .limit(limit)
      .offset(offset),
  ])
  return { rows, total: totalRows[0]?.total ?? 0 }
}

export async function createUser(
  values: typeof schema.users.$inferInsert,
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [user] = await transaction
      .insert(schema.users)
      .values(values)
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        image: schema.users.image,
        createdAt: schema.users.createdAt,
      })

    if (user) {
      await writeAuditLog(
        {
          actorId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          action: "user.created",
          entityType: "user",
          entityId: user.id,
          after: {
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          },
        },
        transaction
      )
    }

    return user
  }, database)
}

export async function updateUser(
  id: string,
  values: Partial<
    Pick<
      typeof schema.users.$inferInsert,
      "name" | "email" | "emailVerified" | "image"
    >
  >,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [before] = await transaction
      .select({
        name: schema.users.name,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        image: schema.users.image,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)
    if (!before) return undefined

    const [user] = await transaction
      .update(schema.users)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        emailVerified: schema.users.emailVerified,
        image: schema.users.image,
        updatedAt: schema.users.updatedAt,
      })

    if (user) {
      await writeAuditLog(
        {
          actorId: actor.id,
          actorName: actor.name,
          actorEmail: actor.email,
          action: "user.updated",
          entityType: "user",
          entityId: user.id,
          before,
          after: {
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
          },
        },
        transaction
      )
    }

    return user
  }, database)
}

export async function deleteUser(
  id: string,
  actor: { id: string; name?: string | null; email?: string | null },
  database: DatabaseOrTransaction = getDatabase()
) {
  return withTransaction(async (transaction) => {
    const [user] = await transaction
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)

    if (!user) return undefined

    await writeAuditLog(
      {
        actorId: actor.id,
        actorName: actor.name,
        actorEmail: actor.email,
        action: "user.deleted",
        entityType: "user",
        entityId: user.id,
        before: { name: user.name, email: user.email },
      },
      transaction
    )

    await transaction.delete(schema.users).where(eq(schema.users.id, id))
    return user
  }, database)
}

export async function listUserAccounts(
  userId: string,
  database: Database = getDatabase()
) {
  return database
    .select({
      id: schema.accounts.id,
      providerId: schema.accounts.providerId,
      accountId: schema.accounts.accountId,
      createdAt: schema.accounts.createdAt,
      updatedAt: schema.accounts.updatedAt,
    })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, userId))
    .orderBy(desc(schema.accounts.createdAt))
}

export async function listVerificationsByIdentifier(
  identifier: string,
  database: Database = getDatabase()
) {
  return database
    .select({
      id: schema.verifications.id,
      identifier: schema.verifications.identifier,
      expiresAt: schema.verifications.expiresAt,
      createdAt: schema.verifications.createdAt,
      updatedAt: schema.verifications.updatedAt,
    })
    .from(schema.verifications)
    .where(eq(schema.verifications.identifier, identifier))
    .orderBy(desc(schema.verifications.createdAt))
}

export async function deleteExpiredVerifications(
  now = new Date(),
  database: DatabaseOrTransaction = getDatabase()
) {
  const deleted = await database
    .delete(schema.verifications)
    .where(lt(schema.verifications.expiresAt, now))
    .returning({ id: schema.verifications.id })

  return deleted.length
}
