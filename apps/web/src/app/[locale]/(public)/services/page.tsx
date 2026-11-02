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
    title: t("services"),
    description: t("servicesDescription"),
    alternates: { canonical: "/services" },
  }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const t = await getScopedI18n("site")
  const services = [
    ["saleServiceTitle", "saleServiceDescription"],
    ["rentalServiceTitle", "rentalServiceDescription"],
    ["investmentServiceTitle", "investmentServiceDescription"],
    ["contactServiceTitle", "contactServiceDescription"],
  ] as const

  return (
    <main className="mx-auto max-w-screen-xl space-y-8 px-5 py-16">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold">{t("servicesTitle")}</h1>
        <p className="text-base leading-8 text-muted-foreground">
          {t("servicesDescription")}
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {services.map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{t(title)}</CardTitle>
              <CardDescription>{t(description)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  )
}
