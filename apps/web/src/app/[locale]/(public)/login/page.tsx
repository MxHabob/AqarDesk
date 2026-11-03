import { isGoogleAuthConfigured } from "@aqardesk/auth/server"
import type { Metadata } from "next"
import { LoginForm } from "@/components/login-form"
import { getI18n } from "@/locales/server"

export const metadata: Metadata = {
  title: "AqarDesk | Sign in",
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getI18n()

  return (
    <main
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="flex min-h-screen bg-background"
    >
      <section className="hidden w-1/2 items-center justify-center bg-muted p-12 lg:flex">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-3xl font-semibold">AqarDesk</p>
          <p className="text-muted-foreground">{t("auth.loginDescription")}</p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">{t("auth.loginTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("auth.loginDescription")}
            </p>
          </header>
          <LoginForm googleEnabled={isGoogleAuthConfigured} />
        </div>
      </section>
    </main>
  )
}
