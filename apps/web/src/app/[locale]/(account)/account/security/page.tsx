import { auth } from "@aqardesk/auth/server"
import { getUserById } from "@aqardesk/database/queries"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { MfaSettingsList } from "@/components/mfa-settings-list"

export const metadata: Metadata = {
  title: "Security | AqarDesk",
  robots: { index: false, follow: false },
}

export default async function AccountSecurityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/${locale}/login`)

  const user = await getUserById(session.user.id)

  return (
    <section className="space-y-8">
      <MfaSettingsList enabled={Boolean(user?.twoFactorEnabled)} />
    </section>
  )
}
