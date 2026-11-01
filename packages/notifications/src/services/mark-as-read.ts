import type { getDatabase } from "@aqardesk/database"
import { notifications } from "@aqardesk/database/schema"
import { and, eq, isNull } from "drizzle-orm"

type Database = ReturnType<typeof getDatabase>

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
