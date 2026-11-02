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
import { LoginForm } from "@/components/auth/login-form"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("auth")

  return {
    title: t("customerLoginTitle"),
    robots: { index: false, follow: false },
  }
}

export default async function CustomerLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const [t, site] = await Promise.all([
    getScopedI18n("auth"),
    getScopedI18n("site"),
  ])

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("customerLoginTitle")}</CardTitle>
          <CardDescription>{t("customerLoginDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <LoginForm defaultDestination="/account" />
          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Button
              nativeButton={false}
              variant="link"
              render={<Link href="/register" />}
            >
              {t("signUp")}
            </Button>
          </p>
          <Button
            nativeButton={false}
            variant="ghost"
            className="w-full"
            render={<Link href="/" />}
          >
            {site("home")}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
