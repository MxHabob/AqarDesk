"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import {
  archiveAllNotificationsAction,
  archiveNotificationAction,
  getNotificationsAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications"

export type Activity = Awaited<
  ReturnType<typeof getNotificationsAction>
>["notifications"][number]

export function getMetadata(activity: Activity): Record<string, unknown> {
  return activity.metadata
}

export function getMetadataProperty(
  activity: Activity,
  key: string
): string | undefined {
  const value = getMetadata(activity)[key]
  return typeof value === "string" ? value : undefined
}

const notificationsQueryKey = ["notifications"] as const

export function useNotifications() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotificationsAction,
    refetchInterval: 60_000,
  })

  const invalidateNotifications = () =>
    queryClient.invalidateQueries({ queryKey: notificationsQueryKey })

  const archiveMutation = useMutation({
    mutationFn: archiveNotificationAction,
    onSuccess: invalidateNotifications,
  })
  const archiveAllMutation = useMutation({
    mutationFn: archiveAllNotificationsAction,
    onSuccess: invalidateNotifications,
  })
  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: invalidateNotifications,
  })

  const markMessageAsRead = useCallback(
    (id: string) => archiveMutation.mutate(id),
    [archiveMutation]
  )
  const markAllMessagesAsRead = useCallback(
    () => archiveAllMutation.mutate(),
    [archiveAllMutation]
  )
  const markAllMessagesAsSeen = useCallback(
    () => markAllReadMutation.mutate(),
    [markAllReadMutation]
  )

  const notifications = data?.notifications ?? []

  return {
    isLoading,
    error,
    notifications,
    archived: data?.archived ?? [],
    hasUnseenNotifications: notifications.some(
      (notification) => notification.status === "unread"
    ),
    markMessageAsRead,
    markAllMessagesAsRead,
    markAllMessagesAsSeen,
  }
}
