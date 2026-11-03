import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"
import { getDatabase, schema } from "../index"
import { normalizePagination } from "../utils/pagination"
import type { DatabaseOrTransaction } from "./types"

export async function listNotifications(
  userId: string,
  options: {
    page?: number
    pageSize?: number
    unreadOnly?: boolean
    archivedOnly?: boolean
    excludeArchived?: boolean
  } = {},
  database = getDatabase()
) {
  const { limit, offset } = normalizePagination(options)

  return database
    .select()
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        options.unreadOnly ? isNull(schema.notifications.readAt) : undefined,
        options.archivedOnly
          ? isNotNull(schema.notifications.archivedAt)
          : undefined,
        options.excludeArchived
          ? isNull(schema.notifications.archivedAt)
          : undefined
      )
    )
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit)
    .offset(offset)
}

export async function createNotification(
  values: typeof schema.notifications.$inferInsert,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [notification] = await database
    .insert(schema.notifications)
    .values(values)
    .returning()

  return notification
}

export async function markNotificationRead(
  id: string,
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [notification] = await database
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    )
    .returning()

  return notification
}

export async function markAllNotificationsRead(
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const notifications = await database
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.readAt)
      )
    )
    .returning({ id: schema.notifications.id })

  return notifications.length
}

export async function archiveNotification(
  id: string,
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const archivedAt = new Date()
  const [notification] = await database
    .update(schema.notifications)
    .set({ readAt: archivedAt, archivedAt })
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.archivedAt)
      )
    )
    .returning()

  return notification
}

export async function archiveAllNotifications(
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const archivedAt = new Date()
  const notifications = await database
    .update(schema.notifications)
    .set({ readAt: archivedAt, archivedAt })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        isNull(schema.notifications.archivedAt)
      )
    )
    .returning({ id: schema.notifications.id })

  return notifications.length
}

export async function deleteNotification(
  id: string,
  userId: string,
  database: DatabaseOrTransaction = getDatabase()
) {
  const [notification] = await database
    .delete(schema.notifications)
    .where(
      and(
        eq(schema.notifications.id, id),
        eq(schema.notifications.userId, userId)
      )
    )
    .returning({ id: schema.notifications.id })

  return notification
}
