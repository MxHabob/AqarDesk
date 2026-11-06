import Link from "next/link"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

export async function SunsetBanner({ locale }: { locale: string }) {
  setStaticParamsLocale(locale)
  const t = await getScopedI18n("site")

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-9 w-full border-b border-border bg-secondary text-foreground">
      <div className="flex h-full items-center justify-center gap-2 px-4 text-center font-sans text-xs sm:text-sm">
        <span>{t("sunsetBanner")}</span>
        <Link
          href="/updates/opening-offer"
          className="font-semibold underline underline-offset-2 hover:text-muted-foreground"
        >
          {t("sunsetBannerLink")}
        </Link>
      </div>
    </div>
  )
}
