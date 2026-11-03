import { auth } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "حسابي | عقار دِسك",
  robots: { index: false, follow: false },
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const isArabic = locale === "ar"

  if (!session) {
    redirect(`/${locale}/login`)
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">
          {isArabic ? "حسابي" : "My account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isArabic
            ? "معلومات الحساب المرتبط بتسجيل دخولك."
            : "Details for the account you signed in with."}
        </p>
      </div>
      <dl className="grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">
            {isArabic ? "الاسم" : "Name"}
          </dt>
          <dd className="font-medium">{session.user.name}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">
            {isArabic ? "البريد الإلكتروني" : "Email"}
          </dt>
          <dd className="font-medium" dir="ltr">
            {session.user.email}
          </dd>
        </div>
      </dl>
    </section>
  )
}
