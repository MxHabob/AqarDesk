import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "تسجيل الدخول | عقار دِسك",
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ locale }, { error }] = await Promise.all([params, searchParams])
  const isArabic = locale === "ar"

  return (
    <main
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className="flex min-h-svh items-center justify-center bg-muted/30 p-4 sm:p-6"
    >
      <section className="w-full max-w-md space-y-6 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2 text-center">
          <Link
            href={`/${locale}`}
            className="text-sm font-semibold text-primary"
          >
            عقار دِسك
          </Link>
          <h1 className="text-2xl font-semibold">
            {isArabic ? "تسجيل الدخول" : "Sign in"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? "استخدم حسابك للمتابعة كعميل أو موظف."
              : "Sign in to continue as a customer or employee."}
          </p>
        </div>

        {error === "role" && (
          <p role="alert" className="text-sm text-destructive">
            {isArabic
              ? "لا يوجد دور مفعّل لهذا الحساب. تواصل مع إدارة المكتب."
              : "This account has no active role. Contact your office administrator."}
          </p>
        )}

        <LoginForm locale={locale} />
      </section>
    </main>
  )
}
