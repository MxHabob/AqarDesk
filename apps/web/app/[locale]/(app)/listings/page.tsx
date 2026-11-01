import type { Metadata } from "next"

import { Card, CardContent } from "@aqardesk/ui/components/card"
import { ListingFilters } from "@/components/listings/listing-filters"
import { getScopedI18n } from "@/locales/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getScopedI18n("listings")
  return { title: t("title"), description: t("description") }
}

export default async function ListingsPage() {
  const [t, common] = await Promise.all([
    getScopedI18n("listings"),
    getScopedI18n("common"),
  ])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>
      <ListingFilters />
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium">{common("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {common("emptyDescription")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
