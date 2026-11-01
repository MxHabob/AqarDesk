import type { getDatabase } from "@aqardesk/database"
import { notifications } from "@aqardesk/database/schema"
import { and, desc, eq, isNull, lt, or } from "drizzle-orm"

type Database = ReturnType<typeof getDatabase>

export interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  body?: string | null
  data?: Record<string, unknown>
}

export interface NotificationCursor {
  createdAt: Date
  id: string
}

export interface ListNotificationsOptions {
  limit?: number
  unreadOnly?: boolean
  before?: NotificationCursor
}

export async function createNotification(
  database: Database,
  input: CreateNotificationInput
) {
  const [notification] = await database
    .insert(notifications)
    .values(input)
    .returning()

  if (!notification) {
    throw new Error("The notification was not created.")
  }

  return notification
}

export function listUserNotifications(
  database: Database,
  userId: string,
  options: ListNotificationsOptions = {}
) {
  const limit = options.limit ?? 30

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Notification limit must be between 1 and 100.")
  }

  const conditions = [eq(notifications.userId, userId)]

  if (options.unreadOnly) {
    conditions.push(isNull(notifications.readAt))
  }

  if (options.before) {
    const cursorCondition = or(
      lt(notifications.createdAt, options.before.createdAt),
      and(
        eq(notifications.createdAt, options.before.createdAt),
        lt(notifications.id, options.before.id)
      )
    )

    if (cursorCondition) {
      conditions.push(cursorCondition)
    }
  }

  return database
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit)
}

export async function markNotificationAsRead(
  database: Database,
  userId: string,
  notificationId: string
) {
  const [notification] = await database
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        isNull(notifications.readAt)
      )
    )
    .returning({ id: notifications.id })

  return notification !== undefined
}

export async function markAllNotificationsAsRead(
  database: Database,
  userId: string
) {
  const updated = await database
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
    .returning({ id: notifications.id })

  return updated.length
}
