import { auth } from "@aqardesk/auth/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

export default async function AppLayout({
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

  return children
}
