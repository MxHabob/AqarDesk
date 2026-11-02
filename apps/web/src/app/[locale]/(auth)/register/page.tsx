import { Button } from "@aqardesk/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import type { Metadata } from "next"
import Link from "next/link"
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
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
        </CardContent>
      </Card>
    </main>
  )
}
