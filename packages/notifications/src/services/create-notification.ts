import type { getDatabase } from "@aqardesk/database"
import { notifications } from "@aqardesk/database/schema"

import { createNotificationSchema } from "../schemas"

type Database = ReturnType<typeof getDatabase>

export async function createNotification(database: Database, input: unknown) {
  const values = createNotificationSchema.parse(input)
  const [notification] = await database
    .insert(notifications)
    .values(values)
    .returning()

  if (!notification) {
    throw new Error("The notification was not created.")
  }

  return notification
}
