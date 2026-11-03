import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider"
import { Sidebar } from "@/components/sidebar"
import { getRoleDestination, getUserRoleKeys } from "@/lib/auth/roles"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const roleKeys = await getUserRoleKeys(session.user.id)
  const destination = getRoleDestination(roleKeys, locale)
  if (destination !== `/${locale}/dashboard`) {
    redirect(destination ?? `/${locale}/login?error=role`)
  }

  return (
    <div className="relative">
      <Sidebar />
      <div className="pb-4 md:ml-[70px]">
        <Header />
        <div className="px-4 md:px-8">{children}</div>
      </div>
      <GlobalSheetsProvider />
    </div>
  )
}
