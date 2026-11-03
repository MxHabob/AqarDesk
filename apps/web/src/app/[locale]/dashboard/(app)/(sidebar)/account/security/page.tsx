import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { MfaSettingsList } from "@/components/mfa-settings-list"

export const metadata: Metadata = {
  title: "Security | AqarDesk",
};

export default async function Security({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="space-y-12">
      <MfaSettingsList enabled={Boolean(session.user.twoFactorEnabled)} />
    </div>
  )
}
