import { auth } from "@aqardesk/auth/server"
import { listUserTeams } from "@aqardesk/database/queries"
import { Button } from "@aqardesk/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@aqardesk/ui/table"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { viewTeamFromAccountAction } from "@/actions/teams"
import { hasPermission } from "@/lib/auth/permissions"
import { getI18n, setStaticParamsLocale } from "@/locales/server"

export const metadata: Metadata = {
  title: "Teams | AqarDesk",
}

export default async function AccountTeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  const [teams, canManage] = await Promise.all([
    listUserTeams(session.user.id),
    hasPermission(session.user.id, "teams.manage"),
  ])

  return (
    <Table>
      <TableBody>
        {teams.length ? (
          teams.map((team) => (
            <TableRow
              key={team.id}
              className="hover:bg-transparent"
            >
              <TableCell className="border-r-0 py-4">
                <span className="text-sm font-medium">{team.name}</span>
              </TableCell>
              <TableCell className="border-r-0 py-4">
                <div className="flex items-center justify-end gap-3">
                  <form action={viewTeamFromAccountAction}>
                    <input type="hidden" name="teamId" value={team.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <Button type="submit" variant="outline">
                      {t("accountSettings.viewTeam")}
                    </Button>
                  </form>
                  {canManage && (
                    <Button
                      render={
                        <Link
                          href={`/${locale}/dashboard/settings/members?teamId=${team.id}`}
                        />
                      }
                      variant="outline"
                    >
                      {t("accountSettings.manageTeam")}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2} className="h-24 text-center">
              {t("accountSettings.noTeams")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
