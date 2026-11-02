import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aqardesk/ui/components/card"
import type { Metadata } from "next"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("site")

  return {
    title: t("about"),
    description: t("aboutDescription"),
    alternates: { canonical: "/about" },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("site")

  return (
    <main className="mx-auto max-w-screen-xl space-y-8 px-5 py-16">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold">{t("aboutTitle")}</h1>
        <p className="text-base leading-8 text-muted-foreground">
          {t("aboutDescription")}
        </p>
      </header>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{t("aboutApproachTitle")}</CardTitle>
          <CardDescription>{t("aboutApproachDescription")}</CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
