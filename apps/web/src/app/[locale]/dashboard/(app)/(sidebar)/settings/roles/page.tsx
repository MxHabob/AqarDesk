import { auth } from "@aqardesk/auth/server"
import {
  listPermissions,
  listRolePermissionAssignments,
  listRoles,
} from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { RoleManagement } from "@/components/settings/role-management"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("accessManagement")
  return { title: t("rolesTitle") }
}

export default async function RolesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("accessManagement")
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  if (!(await hasPermission(session.user.id, "roles.manage"))) {
    return (
      <div role="alert" className="space-y-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">{t("accessDenied")}</p>
        <Link
          href={`/${locale}/dashboard`}
          className="text-sm underline underline-offset-4"
        >
          {t("backToDashboard")}
        </Link>
      </div>
    )
  }

  const [roles, permissions] = await Promise.all([
    listRoles(),
    listPermissions(),
  ])
  const assignments = await listRolePermissionAssignments(
    roles.map((role) => role.id)
  )
  const permissionIdsByRole = new Map<string, string[]>()
  for (const assignment of assignments) {
    const permissionIds = permissionIdsByRole.get(assignment.roleId) ?? []
    permissionIds.push(assignment.permissionId)
    permissionIdsByRole.set(assignment.roleId, permissionIds)
  }

  return (
    <RoleManagement
      roles={roles.map((role) => ({
        ...role,
        permissionIds: permissionIdsByRole.get(role.id) ?? [],
      }))}
      permissions={permissions.map(({ id, key }) => ({ id, key }))}
    />
  )
}
