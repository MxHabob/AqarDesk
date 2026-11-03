import { auth } from "@aqardesk/auth/server"
import { listTeamMembers, listUsers } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUserTeamsAction } from "@/actions/teams"
import { TeamMembers } from "@/components/team-members"
import { CreateTeamForm } from "@/components/teams/create-team-form"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("teamManagement")

  return { title: t("membersPageTitle") }
}

export default async function Members({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ teamId?: string }>
}) {
  const [{ locale }, { teamId: requestedTeamId }] = await Promise.all([
    params,
    searchParams,
  ])
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("teamManagement")
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  const [canRead, canManage, teamData] = await Promise.all([
    hasPermission(session.user.id, "teams.read"),
    hasPermission(session.user.id, "teams.manage"),
    getUserTeamsAction(),
  ])
  if (!canRead && !canManage) {
    return (
      <p
        role="alert"
        className="py-12 text-center text-sm text-muted-foreground"
      >
        {t("membersAccessDenied")}
      </p>
    )
  }

  const team =
    teamData.teams.find((item) => item.id === requestedTeamId) ??
    teamData.teams.find((item) => item.id === teamData.selectedTeamId)
  if (!team) {
    return (
      <section className="space-y-5">
        <div>
          <h1 className="text-lg font-medium">{t("membersTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("membersDescription")}
          </p>
        </div>
        {canManage ? (
          <CreateTeamForm />
        ) : (
          <Link
            className="text-sm underline underline-offset-4"
            href={`/${locale}/dashboard`}
          >
            {t("backToDashboard")}
          </Link>
        )}
      </section>
    )
  }

  const [members, usersPage] = await Promise.all([
    listTeamMembers(team.id),
    canManage ? listUsers({ page: 1, pageSize: 100 }) : undefined,
  ])
  const memberIds = new Set(members.map((member) => member.userId))
  const availableUsers =
    usersPage?.rows
      .filter((user) => !memberIds.has(user.id))
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })) ?? []

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">{t("membersTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{team.name}</p>
      </div>
      <TeamMembers
        teamId={team.id}
        members={members}
        availableUsers={availableUsers}
        canManage={canManage}
      />
    </section>
  )
}
