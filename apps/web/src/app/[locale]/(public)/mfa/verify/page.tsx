import { auth, isEmailOtpConfigured } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { VerifyMfa } from "@/components/verify-mfa"

export const metadata: Metadata = {
  title: "Verify sign in | AqarDesk",
}

export default async function Verify({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ methods?: string | string[] }>
}) {
  const [{ locale }, { methods }] = await Promise.all([params, searchParams])
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect(`/${locale}/login/callback`)
  }

  const availableMethods =
    typeof methods === "string" ? methods.split(",") : (methods ?? [])

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen items-center justify-center p-6"
    >
      <div className="w-full max-w-md">
        <VerifyMfa
          emailOtpAvailable={
            isEmailOtpConfigured && availableMethods.includes("otp")
          }
        />
      </div>
    </main>
  )
}
