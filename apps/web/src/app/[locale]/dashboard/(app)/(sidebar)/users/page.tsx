import { auth } from "@aqardesk/auth/server"
import {
  listRoles,
  listUserRoleAssignments,
  listUsers,
} from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { UsersTable } from "@/components/tables/users"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"
import { getInitialTableSettings } from "@/utils/columns"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("accessManagement")
  return { title: t("usersTitle") }
}

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>
}) {
  const [{ locale }, search] = await Promise.all([params, searchParams])
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("accessManagement")
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  if (!(await hasPermission(session.user.id, "users.manage"))) {
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

  const query = typeof search.q === "string" ? search.q.trim() : ""
  const pageNumber = Number(typeof search.page === "string" ? search.page : 1)
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1
  const [usersPage, roles] = await Promise.all([
    listUsers({ page, pageSize: 50, query }),
    listRoles(),
  ])
  const totalPages = Math.max(1, Math.ceil(usersPage.total / 50))
  const safePage = Math.min(page, totalPages)
  const assignments = await listUserRoleAssignments(
    usersPage.rows.map((user) => user.id)
  )
  const roleIdsByUser = new Map<string, string[]>()
  for (const assignment of assignments) {
    const roleIds = roleIdsByUser.get(assignment.userId) ?? []
    roleIds.push(assignment.roleId)
    roleIdsByUser.set(assignment.userId, roleIds)
  }

  return (
    <UsersTable
      locale={locale}
      query={query}
      users={usersPage.rows.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        roleIds: roleIdsByUser.get(user.id) ?? [],
      }))}
      roles={roles.map(({ id, key, name }) => ({ id, key, name }))}
      currentUserId={session.user.id}
      page={safePage}
      totalPages={totalPages}
      totalUsers={usersPage.total}
      initialSettings={await getInitialTableSettings("users")}
    />
  )
}
