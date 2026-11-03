"use server"

import { auth } from "@aqardesk/auth/server"
import {
  archiveAllNotifications,
  archiveNotification,
  listNotifications,
  markAllNotificationsRead,
} from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { z } from "zod"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  return session.user.id
}

function toActivity(
  notification: Awaited<ReturnType<typeof listNotifications>>[number]
) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    metadata: notification.data ?? {},
    status: notification.archivedAt
      ? ("archived" as const)
      : notification.readAt
        ? ("read" as const)
        : ("unread" as const),
    createdAt: notification.createdAt,
  }
}

export async function getNotificationsAction() {
  const userId = await getUserId()
  const [inbox, archived] = await Promise.all([
    listNotifications(userId, { pageSize: 20, excludeArchived: true }),
    listNotifications(userId, { pageSize: 20, archivedOnly: true }),
  ])

  return {
    notifications: inbox.map(toActivity),
    archived: archived.map(toActivity),
  }
}

export async function archiveNotificationAction(id: string) {
  const userId = await getUserId()
  return archiveNotification(z.uuid().parse(id), userId)
}

export async function markAllNotificationsReadAction() {
  return markAllNotificationsRead(await getUserId())
}

export async function archiveAllNotificationsAction() {
  return archiveAllNotifications(await getUserId())
}
