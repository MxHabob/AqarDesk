import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { Header } from "@/components/account/header"
import { initializeLocale } from "@/locales/server"

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

  return (
    <div className="mx-auto min-h-svh max-w-screen-2xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <Header />
      <main>{children}</main>
    </div>
  )
}
