import { auth } from "@aqardesk/auth/server"
import { listUserTeams } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
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

  return { title: t("teamsPageTitle") }
}

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("teamManagement")
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  const [teams, canManage] = await Promise.all([
    listUserTeams(session.user.id),
    hasPermission(session.user.id, "teams.manage"),
  ])
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-8 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      {teams.length > 0 ? (
        <div className="divide-y divide-border border-y border-border">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{team.name}</p>
                <p className="text-xs text-muted-foreground">{team.id}</p>
              </div>
              <Link
                href={`/${locale}/dashboard/settings/members?teamId=${team.id}`}
                className="inline-flex h-8 items-center border border-border px-3 text-xs hover:bg-accent"
              >
                {t("manageMembers")}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noTeam")}</p>
      )}

      {canManage && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">{t("createTeam")}</h2>
          <CreateTeamForm />
        </section>
      )}
    </main>
  )
}
