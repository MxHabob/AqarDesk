export const notificationTypeValues = [
  "listing_assigned",
  "listing_status_changed",
  "listing_updated",
  "listing_expiring",
] as const

export type NotificationType = (typeof notificationTypeValues)[number]

export interface NotificationDefinition {
  type: NotificationType
  category: "listings"
  showInSettings: boolean
}

export const notificationTypes = [
  {
    type: "listing_assigned",
    category: "listings",
    showInSettings: true,
  },
  {
    type: "listing_status_changed",
    category: "listings",
    showInSettings: true,
  },
  {
    type: "listing_updated",
    category: "listings",
    showInSettings: true,
  },
  {
    type: "listing_expiring",
    category: "listings",
    showInSettings: true,
  },
] as const satisfies readonly NotificationDefinition[]
