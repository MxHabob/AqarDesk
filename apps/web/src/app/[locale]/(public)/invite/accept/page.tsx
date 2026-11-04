import { createHash } from "node:crypto"
import { auth } from "@aqardesk/auth/server"
import { getUserInvitationByTokenHash } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { acceptUserInvitationAction } from "@/actions/user-invitations"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("inviteAcceptance")
  return { title: t("title") }
}

export default async function AcceptInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams])
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("inviteAcceptance")
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) {
    return <InvitationMessage title={t("invalid")} />
  }

  const invitation = await getUserInvitationByTokenHash(
    createHash("sha256").update(token).digest("hex")
  )
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= new Date()
  ) {
    return <InvitationMessage title={t("invalid")} />
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    const next = `/${locale}/invite/accept?token=${encodeURIComponent(token)}`
    redirect(`/${locale}/login?next=${encodeURIComponent(next)}`)
  }
  if (
    invitation.userId !== session.user.id ||
    invitation.email !== session.user.email.toLowerCase()
  ) {
    return (
      <InvitationMessage title={t("wrongAccount")} detail={invitation.email} />
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl items-center px-6 py-12">
      <section className="w-full space-y-6 border border-border p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("description", { name: invitation.name })}
          </p>
        </div>
        <p className="text-sm">{invitation.email}</p>
        <form action={acceptUserInvitationAction}>
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("accept")}
          </button>
        </form>
      </section>
    </main>
  )
}

function InvitationMessage({
  title,
  detail,
}: {
  title: string
  detail?: string
}) {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl items-center px-6 py-12">
      <section className="w-full space-y-3 border border-border p-6 sm:p-8">
        <h1 className="text-xl font-semibold">{title}</h1>
        {detail && (
          <p className="break-all text-sm text-muted-foreground">{detail}</p>
        )}
      </section>
    </main>
  )
}
