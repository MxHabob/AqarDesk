import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("account")

  return {
    title: t("title"),
    robots: { index: false, follow: false },
  }
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("account")
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("accountInfoDescription")}
        </p>
      </div>
      <dl className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">{t("name")}</dt>
          <dd className="font-medium">{session.user.name}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">{t("email")}</dt>
          <dd className="font-medium" dir="ltr">
            {session.user.email}
          </dd>
        </div>
      </dl>
    </section>
  )
}
