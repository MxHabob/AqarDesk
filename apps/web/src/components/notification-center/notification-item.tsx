"use client"

import { Button } from "@aqardesk/ui/button"
import { cn } from "@aqardesk/ui/cn"
import { Icons } from "@aqardesk/ui/icons"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import {
  type Activity,
  getMetadata,
  getMetadataProperty,
} from "@/hooks/use-notifications"
import { useCurrentLocale } from "@/locales/client"
import { getActivityIcon } from "@/utils/activity-utils"
import { NotificationLink } from "./notification-link"

interface NotificationItemProps {
  id: string
  setOpen: (open: boolean) => void
  activity: Activity
  markMessageAsRead?: (id: string) => void
}

export function NotificationItem({
  id,
  setOpen,
  activity,
  markMessageAsRead,
}: NotificationItemProps) {
  const isArabic = useCurrentLocale() === "ar"

  const recordId = getMetadataProperty(activity, "recordId")
  const metadata = getMetadata(activity)
  const description = activity.title || activity.type.replaceAll("_", " ")
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: isArabic ? ar : undefined,
  })

  const notificationContent = (
    <>
      <div>
        <div className="h-9 w-9 flex items-center justify-center space-y-0 border rounded-full">
          {getActivityIcon(activity.type)}
        </div>
      </div>
      <div>
        <p
          className={cn(
            "text-sm",
            activity.status === "unread" && "font-medium"
          )}
        >
          {description}
        </p>
        <span className="text-xs text-[#606060]">{timeAgo}</span>
      </div>
    </>
  )

  const actionButton = markMessageAsRead && (
    <div>
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full bg-transparent dark:hover:bg-[#1A1A1A] hover:bg-[#F6F6F3]"
        onClick={() => markMessageAsRead(id)}
        title={isArabic ? "أرشفة الإشعار" : "Archive notification"}
      >
        <Icons.Inventory2 />
      </Button>
    </div>
  )

  return (
    <NotificationLink
      activityType={activity.type}
      recordId={recordId}
      metadata={metadata}
      onNavigate={() => setOpen(false)}
      className="flex items-between gap-x-4 flex-1 text-start"
      actionButton={actionButton}
    >
      {notificationContent}
    </NotificationLink>
  )
}
