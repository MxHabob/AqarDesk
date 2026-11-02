import Link from "next/link"
import type { ReactNode } from "react"

import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const [t, common] = await Promise.all([
    getScopedI18n("site"),
    getScopedI18n("common"),
  ])

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <nav
          aria-label={common("navigationLabel")}
          className="mx-auto flex min-h-16 max-w-screen-xl flex-wrap items-center justify-between gap-4 px-5"
        >
          <Link href="/" className="font-semibold">
            AqarDesk
          </Link>
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <Link href="/">{t("home")}</Link>
            <Link href="/browse">{t("browse")}</Link>
            <Link href="/about">{t("about")}</Link>
            <Link href="/services">{t("services")}</Link>
            <Link href="/account">{t("customerAccount")}</Link>
            <LanguageSwitcher />
            <Link href="/login" className="border px-3 py-2 font-medium">
              {t("login")}
            </Link>
          </div>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>AqarDesk</span>
          <span>{t("footerDescription")}</span>
          <span>
            © {new Date().getFullYear()} {t("copyright")}
          </span>
        </div>
      </footer>
    </div>
  )
}
