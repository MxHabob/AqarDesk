import { auth } from "@aqardesk/auth/server"
import { getUserPermissionKeys } from "@aqardesk/database/queries"
import { headers } from "next/headers"
import { SecondaryMenu } from "@/components/secondary-menu"
import { getScopedI18n } from "@/locales/server"

export async function SettingsNavigation() {
  const [session, settings, operations, navigation] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getScopedI18n("settingsNavigation"),
    getScopedI18n("operationsManagement"),
    getScopedI18n("navigation"),
  ])
  if (!session) return null

  const permissionKeys = [
    "office_settings.read",
    "teams.read",
    "teams.manage",
    "roles.manage",
    "office_settings.manage",
    "audit.read",
    "properties.archive",
    "owners.update",
    "media.manage",
    "listings.share",
  ] as const
  const grantedPermissions = new Set(
    await getUserPermissionKeys(session.user.id)
  )
  const permissions = Object.fromEntries(
    permissionKeys.map((key) => [key, grantedPermissions.has(key)])
  )

  const items = [
    ...(permissions["office_settings.read"]
      ? [{ path: "/dashboard/settings", label: settings("general") }]
      : []),
    ...(permissions["office_settings.manage"]
      ? [{ path: "/dashboard/settings/fields", label: "حقول العقارات" }]
      : []),
    ...(permissions["teams.read"] || permissions["teams.manage"]
      ? [{ path: "/dashboard/settings/members", label: settings("members") }]
      : []),
    ...(permissions["roles.manage"]
      ? [
          {
            path: "/dashboard/settings/roles",
            label: settings("permissions"),
          },
        ]
      : []),
    ...(permissions["office_settings.manage"]
      ? [
          {
            path: "/dashboard/settings/developer",
            label: navigation("developer"),
          },
        ]
      : []),
    ...(permissions["audit.read"]
      ? [
          {
            path: "/dashboard/settings/audit",
            label: operations("auditTitle"),
          },
        ]
      : []),
    ...(permissions["properties.archive"] || permissions["owners.update"]
      ? [
          {
            path: "/dashboard/settings/archive",
            label: operations("archiveTitle"),
          },
        ]
      : []),
    ...(permissions["media.manage"]
      ? [
          {
            path: "/dashboard/settings/media",
            label: operations("mediaTitle"),
          },
        ]
      : []),
    ...(permissions["listings.share"]
      ? [
          {
            path: "/dashboard/settings/share-links",
            label: operations("linksTitle"),
          },
        ]
      : []),
  ]

  return items.length > 0 ? <SecondaryMenu items={items} /> : null
}

export async function UserManagementNavigation() {
  const [session, settings, operations] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getScopedI18n("settingsNavigation"),
    getScopedI18n("operationsManagement"),
  ])
  if (!session) return null

  const permissions = new Set(await getUserPermissionKeys(session.user.id))
  if (!permissions.has("users.manage")) return null

  return (
    <SecondaryMenu
      items={[
        { path: "/dashboard/users", label: settings("users") },
        {
          path: "/dashboard/users/invitations",
          label: operations("invitationsTitle"),
        },
      ]}
    />
  )
}
