import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AccountNavigation } from "@/components/account/account-navigation"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"

export const metadata: Metadata = {
  title: "Customer Account | AqarDesk",
  robots: { index: false, follow: false },
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
  const destination = getRoleDestination(roleKeys, locale)
  if (destination !== `/${locale}/account`) {
    redirect(destination ?? `/${locale}/login?error=role`)
  }

  return (
    <div
      className="mx-auto min-h-svh max-w-screen-2xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <header className="flex flex-col gap-5">
        <Link className="text-lg font-semibold" href={`/${locale}`}>
          عقار دِسك
        </Link>
        <AccountNavigation locale={locale} />
      </header>
      <main>{children}</main>
    </div>
  )
}
