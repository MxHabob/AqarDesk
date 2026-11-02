import { Button } from "@aqardesk/ui/components/button"
import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { RegisterForm } from "@/components/auth/register-form"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("auth")

  return {
    title: t("registerTitle"),
    robots: { index: false, follow: false },
  }
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("auth")

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-4 sm:p-6">
      <AuthCard title={t("registerTitle")} description={t("registerDescription")}>
        <div className="space-y-5">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Button
              nativeButton={false}
              variant="link"
              render={<Link href="/account/login" />}
            >
              {t("signIn")}
            </Button>
          </p>
        </div>
      </AuthCard>
    </main>
  )
}
