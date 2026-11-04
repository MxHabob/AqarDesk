import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { VerifyMfa } from "@/components/verify-mfa"

export const metadata: Metadata = {
  title: "Verify sign in | AqarDesk",
}

export default async function Verify({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect(`/${locale}/login/callback`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <VerifyMfa />
      </div>
    </main>
  )
}
