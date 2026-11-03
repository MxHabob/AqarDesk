import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function SunsetBanner({ locale }: { locale: string }) {
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")

  return (
    <div className="w-full bg-secondary border-b border-border text-foreground">
      <div className="px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-sans text-center">
        <span>{t("sunsetBanner")}</span>
      </div>
    </div>
  )
}
