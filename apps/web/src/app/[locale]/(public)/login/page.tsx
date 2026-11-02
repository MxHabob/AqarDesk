import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { getScopedI18n } from "@/locales/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getScopedI18n("auth")
  return { title: t("loginTitle"), robots: { index: false, follow: false } }
}

export default async function LoginPage() {
  const t = await getScopedI18n("auth")

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold">AqarDesk</p>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
