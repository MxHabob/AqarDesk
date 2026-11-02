import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { ServiceGrid } from "@/components/public/service-grid"
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
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader
        title={t("servicesTitle")}
        description={t("servicesDescription")}
      />
      <ServiceGrid
        services={services.map(([title, description]) => ({
          title: t(title),
          description: t(description),
        }))}
      />
    </main>
  )
}
