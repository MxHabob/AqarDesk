import type { getDatabase } from "@aqardesk/database"
import { notifications } from "@aqardesk/database/schema"
import { and, desc, eq, isNull, lt, or } from "drizzle-orm"

import {
  type ListNotificationsOptions,
  listNotificationsOptionsSchema,
} from "../schemas"

type Database = ReturnType<typeof getDatabase>

export function listUserNotifications(
  database: Database,
  userId: string,
  options: ListNotificationsOptions = {}
) {
  if (!userId) {
    throw new Error("A user ID is required to list notifications.")
  }

  const { limit, unreadOnly, before } =
    listNotificationsOptionsSchema.parse(options)
  const conditions = [eq(notifications.userId, userId)]

  if (unreadOnly) {
    conditions.push(isNull(notifications.readAt))
  }

  if (before) {
    const cursorCondition = or(
      lt(notifications.createdAt, before.createdAt),
      and(
        eq(notifications.createdAt, before.createdAt),
        lt(notifications.id, before.id)
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
