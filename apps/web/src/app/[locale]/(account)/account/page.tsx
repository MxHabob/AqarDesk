import type { Metadata } from "next"
import { Suspense } from "react"
import { AccountSettings } from "@/components/account-settings"
import { SettingsLoading } from "@/components/settings-loading"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"
import { getQueryClient, HydrateClient } from "@/queries/server"
import { userSettingsQueryOptions } from "@/queries/user-settings"

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
  void getQueryClient().prefetchQuery(userSettingsQueryOptions())

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </header>
      <HydrateClient>
        <Suspense fallback={<SettingsLoading />}>
          <AccountSettings />
        </Suspense>
      </HydrateClient>
    </section>
  )
}
