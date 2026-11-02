import type { ReactNode } from "react"
import { Footer } from "@/components/public/footer"
import { Header } from "@/components/public/header"
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
      <Header
        labels={{
          home: t("home"),
          browse: t("browse"),
          about: t("about"),
          services: t("services"),
          account: t("customerAccount"),
          login: t("login"),
        }}
        navigationLabel={common("navigationLabel")}
      />
      <div className="flex-1">{children}</div>
      <Footer
        description={t("footerDescription")}
        copyright={t("copyright")}
      />
    </div>
  )
}
