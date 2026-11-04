import type { Metadata } from "next"
import { Suspense } from "react"
import { ChangeTimezone } from "@/components/change-timezone"
import { DateFormatSettings } from "@/components/date-format-settings"
import { LocaleSettings } from "@/components/locale-settings"
import { SettingsLoading } from "@/components/settings-loading"
import { TimeFormatSettings } from "@/components/time-format-settings"
import { WeekSettings } from "@/components/week-settings"
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
  const t = await getScopedI18n("accountSettings")

  return {
    title: t("dateAndLocale"),
    robots: { index: false, follow: false },
  }
}

export default async function DateAndLocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("accountSettings")
  void getQueryClient().prefetchQuery(userSettingsQueryOptions())

  return (
    <HydrateClient>
      <Suspense fallback={<SettingsLoading />}>
        <section className="space-y-8">
          <h1 className="text-2xl font-semibold">{t("dateAndLocale")}</h1>
          <LocaleSettings />
          <ChangeTimezone />
          <TimeFormatSettings />
          <DateFormatSettings />
          <WeekSettings />
        </section>
      </Suspense>
    </HydrateClient>
  )
}
