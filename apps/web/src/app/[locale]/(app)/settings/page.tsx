import { getScopedI18n, initializeLocale } from "@/locales/server"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("common")

  return <h1 className="text-2xl font-semibold">{t("settings")}</h1>
}
