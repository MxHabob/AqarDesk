import type { Metadata } from "next"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("auth")
  return { title: t("loginTitle"), robots: { index: false, follow: false } }
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("auth")

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4 sm:p-6">
      <AuthCard
        brand="AqarDesk"
        title={t("loginTitle")}
        description={t("loginDescription")}
      >
        <LoginForm />
      </AuthCard>
    </main>
  )
}
