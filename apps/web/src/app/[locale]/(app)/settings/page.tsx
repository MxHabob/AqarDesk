import { getScopedI18n } from "@/locales/server"

export default async function SettingsPage() {
  const t = await getScopedI18n("common")

  return <h1 className="text-2xl font-semibold">{t("settings")}</h1>
}
