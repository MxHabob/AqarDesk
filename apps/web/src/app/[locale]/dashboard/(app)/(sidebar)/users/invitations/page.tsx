import { auth } from "@aqardesk/auth/server"
import { listRoles, listUserInvitations } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { UserManagementNavigation } from "@/components/management-navigation"
import { UserInvitations } from "@/components/tables/users/invitations"
import { hasPermission } from "@/lib/auth/permissions"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("invitationManagement")
  return { title: t("title") }
}

export default async function UserInvitationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const [session, t] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getScopedI18n("accessManagement"),
  ])
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

  const [invitations, roles] = await Promise.all([
    listUserInvitations(),
    listRoles(),
  ])
  return (
    <div className="space-y-6 py-6">
      <UserManagementNavigation />
      <UserInvitations
        locale={locale}
        roles={roles.map(({ id, key, name }) => ({ id, key, name }))}
        invitations={invitations.map((invitation) => ({
          ...invitation,
          expiresAt: invitation.expiresAt.toISOString(),
          acceptedAt: invitation.acceptedAt?.toISOString() ?? null,
          revokedAt: invitation.revokedAt?.toISOString() ?? null,
          createdAt: invitation.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
