import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { hasPermission } from "@/lib/auth/permissions"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    redirect("/login")
  }

  if (!(await hasPermission(session.user.id, "listings.read"))) {
    redirect("/account")
  }

  return <AppShell>{children}</AppShell>
}
