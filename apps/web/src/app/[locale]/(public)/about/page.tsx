import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { AboutApproach } from "@/components/public/about-approach"
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
    <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <PageHeader title={t("aboutTitle")} description={t("aboutDescription")} />
      <AboutApproach
        title={t("aboutApproachTitle")}
        description={t("aboutApproachDescription")}
      />
    </main>
  )
}
