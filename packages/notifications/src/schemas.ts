import { z } from "zod"

import { notificationTypeValues } from "./notification-types"

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(notificationTypeValues),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(2000).nullable().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const listNotificationsOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(30),
  unreadOnly: z.boolean().default(false),
  before: z
    .object({
      createdAt: z.date(),
      id: z.uuid(),
    })
    .optional(),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
export type ListNotificationsOptions = z.input<
  typeof listNotificationsOptionsSchema
>
export type NotificationCursor = NonNullable<ListNotificationsOptions["before"]>
