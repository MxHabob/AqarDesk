import { Card, CardContent } from "@aqardesk/ui/components/card"
import type { Metadata } from "next"
import { getScopedI18n, initializeLocale } from "@/locales/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await initializeLocale(params)
  const t = await getScopedI18n("favorites")
  return { title: t("title"), description: t("description") }
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await initializeLocale(params)
  const [t, common] = await Promise.all([
    getScopedI18n("favorites"),
    getScopedI18n("common"),
  ])

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {common("emptyDescription")}
        </CardContent>
      </Card>
    </section>
  )
}
