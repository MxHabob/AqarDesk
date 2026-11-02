import { auth } from "@aqardesk/auth/server"
import { Button } from "@aqardesk/ui/components/button"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { SignOutButton } from "@/components/account/sign-out-button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/account/login")
  }

  const t = await getScopedI18n("account")

  return (
    <div className="mx-auto min-h-svh max-w-screen-xl space-y-8 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <Link href="/account" className="font-semibold">
          {t("title")}
        </Link>
        <nav className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" render={<Link href="/account" />}>
            {t("title")}
          </Button>
          <Button variant="ghost" render={<Link href="/account/favorites" />}>
            {t("favoritesTitle")}
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            AqarDesk
          </Button>
          <LanguageSwitcher />
          <SignOutButton />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
