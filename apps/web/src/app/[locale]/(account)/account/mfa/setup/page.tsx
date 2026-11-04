import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SetupMfa } from "@/components/setup-mfa"

export const metadata: Metadata = {
  title: "Setup MFA | AqarDesk",
  robots: { index: false, follow: false },
}

export default async function AccountMfaSetupPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  return <SetupMfa />
}
