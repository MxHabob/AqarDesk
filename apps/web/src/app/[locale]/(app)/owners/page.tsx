import type { Metadata } from "next"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("owners")
  return { title: t("title"), description: t("description") }
}

export default async function OwnersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const [t, common] = await Promise.all([
    getScopedI18n("owners"),
    getScopedI18n("common"),
  ])

  return (
    <section className="space-y-5">
      <PageHeader title={t("title")} />
      <EmptyState description={common("emptyDescription")} />
    </section>
  )
}
