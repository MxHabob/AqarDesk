import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import { SecondaryMenu } from "@/components/secondary-menu"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n } from "@/locales/server"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, t] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getScopedI18n("settingsNavigation"),
  ])
  const permissions = session
    ? await Promise.all([
        hasPermission(session.user.id, "office_settings.read"),
        hasPermission(session.user.id, "teams.read"),
        hasPermission(session.user.id, "teams.manage"),
        hasPermission(session.user.id, "roles.manage"),
      ])
    : [false, false, false, false]
  const [canReadSettings, canReadTeams, canManageTeams, canManageRoles] =
    permissions
  const items = [
    ...(canReadSettings
      ? [{ path: "/dashboard/settings", label: t("general") }]
      : []),
    ...(canReadTeams || canManageTeams
      ? [{ path: "/dashboard/settings/members", label: t("members") }]
      : []),
    ...(canManageRoles
      ? [{ path: "/dashboard/settings/roles", label: t("permissions") }]
      : []),
  ]

  return (
    <div className="max-w-6xl">
      {items.length > 0 && <SecondaryMenu items={items} />}
      <main className="mt-8">{children}</main>
    </div>
  )
}
