import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AccountNavigation } from "@/components/account/account-navigation"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"
import { getScopedI18n, setStaticParamsLocale } from "@/locales/server"

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

export default async function AccountLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const roleKeys = await getUserRoleKeys(session.user.id)
  const roleDestination = getRoleDestination(roleKeys, locale)
  if (!roleDestination) redirect(`/${locale}/login?error=role`)

  return (
    <div
      className="min-h-svh w-full space-y-8 px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <AccountNavigation locale={locale} roleDestination={roleDestination} />
      <main className="w-full max-w-5xl">{children}</main>
    </div>
  )
}
