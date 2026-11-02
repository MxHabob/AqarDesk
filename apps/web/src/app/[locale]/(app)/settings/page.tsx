import { PageHeader } from "@/components/layout/page-header"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("common")

  return <PageHeader title={t("settings")} />
}
